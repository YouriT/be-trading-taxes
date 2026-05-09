import { chromium, Page, BrowserContext } from "playwright";
import { openai } from "@/lib/openai";

export interface AgentTask {
  month: number;
  year: number;
  aggregates: {
    rate: number;
    count: number;
    base: number;
    tax: number;
  }[];
}

export class MyMinfinAgent {
  private page!: Page;
  private context!: BrowserContext;
  private onUpdate: (data: any) => void;

  constructor(onUpdate: (data: any) => void) {
    this.onUpdate = onUpdate;
  }

  async run(task: AgentTask, dryRun = true) {
    const browser = await chromium.launch({ headless: true });
    this.context = await browser.newContext();
    this.page = await this.context.newPage();

    // Setup screenshot interval for "live view"
    const screenshotInterval = setInterval(async () => {
      if (this.page.isClosed()) return;
      try {
        const screenshot = await this.page.screenshot({ type: 'jpeg', quality: 50 });
        this.onUpdate({ type: "screenshot", data: screenshot.toString("base64") });
      } catch (e) {}
    }, 1000);

    try {
      this.onUpdate({ status: "navigating", message: "Connecting to MyMinfin..." });
      await this.page.goto("https://divtax.minfin.fgov.be/");

      // 1. Authentication (itsme)
      await this.page.click('text="itsme"');

      this.onUpdate({ status: "waiting_auth", message: "Please scan the itsme QR code" });

      await this.page.waitForURL("**/divtax/**", { timeout: 120000 });

      this.onUpdate({ status: "logged_in", message: "Successfully logged in" });

      // 2. Navigate to TOB
      await this.safeClick('text="Ma déclaration"', 'text="Taxes diverses"');
      await this.safeClick('text="TOB"');
      await this.safeClick('text="Nouvelle déclaration"');

      // 3. Fill Form
      this.onUpdate({ status: "filling", message: "Filling declaration form..." });

      await this.page.selectOption('select[name="period_month"]', task.month.toString());
      await this.page.selectOption('select[name="period_year"]', task.year.toString());

      for (const agg of task.aggregates) {
        const rowSelector = await this.findRowByRate(agg.rate);
        await this.page.fill(`${rowSelector} .count`, agg.count.toString());
        await this.page.fill(`${rowSelector} .base`, agg.base.toFixed(2));
        await this.page.fill(`${rowSelector} .tax`, agg.tax.toFixed(2));
      }

      if (dryRun) {
        this.onUpdate({ status: "dry_run_complete", message: "Form filled. Please review before submission." });
        return;
      }

      await this.page.click('button[type="submit"]');

      const reference = await this.page.textContent(".payment-reference");
      const iban = await this.page.textContent(".payment-iban");

      this.onUpdate({
        status: "submitted",
        message: "Declaration submitted!",
        data: { reference, iban }
      });

    } catch (error: any) {
      this.onUpdate({ status: "error", message: `Agent failed: ${error.message}` });
      await this.handleSelfHealing(error);
    } finally {
      clearInterval(screenshotInterval);
      if (!dryRun) await browser.close();
    }
  }

  private async safeClick(...selectors: string[]) {
    for (const selector of selectors) {
      try {
        await this.page.click(selector, { timeout: 5000 });
      } catch (e) {
        const recovered = await this.handleSelfHealing(e, selector);
        if (recovered) await this.page.click(recovered);
        else throw e;
      }
    }
  }

  private async findRowByRate(rate: number): Promise<string> {
    return `tr:has-text("${(rate * 100).toFixed(2)}%")`;
  }

  private async handleSelfHealing(error: any, selector?: string): Promise<string | null> {
    if (!openai) return null;

    this.onUpdate({ status: "healing", message: "UI change detected. Attempting to recover..." });

    const dom = await this.page.content();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an automation repair expert. Given a DOM and a failed selector, find the new correct selector for the intended action."
        },
        {
          role: "user",
          content: `The selector "${selector}" failed on this page. Here is the DOM: ${dom.slice(0, 10000)}`
        }
      ]
    });

    const newSelector = response.choices[0].message.content;
    return newSelector;
  }
}
