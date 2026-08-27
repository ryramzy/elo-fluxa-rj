export interface BrokenContentItem {
  page: string;
  pattern: string;
  context: string;
}

export interface ConsoleAuditItem {
  page: string;
  type: 'error' | 'warning';
  text: string;
}

export interface NetworkErrorItem {
  page: string;
  url: string;
  status: number;
}

export interface QaCategoryResult {
  category: string;
  pass: number;
  fail: number;
  degraded: number;
  needsManual: number;
}

export interface PerformanceMetrics {
  landingPageLoadTimeSec?: number;
  dashboardLoadTimeSec?: number;
  coursesPageLoadTimeSec?: number;
  pwaScore?: number;
  performanceScore?: number;
  accessibilityScore?: number;
}

export interface FailureDetail {
  category: string;
  page: string;
  title: string;
  error: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  stepsToReproduce?: string;
  isKnown?: boolean;
}

export interface DegradedDetail {
  category: string;
  page: string;
  title: string;
  detail: string;
}

export interface ManualCheckItem {
  category: string;
  item: string;
  reason: string;
}

export class QaCollector {
  private static instance: QaCollector;

  public brokenContent: BrokenContentItem[] = [];
  public consoleErrors: ConsoleAuditItem[] = [];
  public networkErrors: NetworkErrorItem[] = [];
  public metrics: PerformanceMetrics = {};
  public criticalFailures: FailureDetail[] = [];
  public degradedItems: DegradedDetail[] = [];
  public manualChecks: ManualCheckItem[] = [];
  public observations: string[] = [];
  public watchList: string[] = [
    'Facebook Pixel YOUR_PIXEL_ID_HERE token in HTML',
    'Push notification permission on iOS PWA',
    'Booking slot synchronization between VisualSlotPicker and Hero Card',
    'Tutor ID migrations (matthew -> matt)',
  ];

  public static getInstance(): QaCollector {
    if (!QaCollector.instance) {
      QaCollector.instance = new QaCollector();
    }
    return QaCollector.instance;
  }

  public recordBrokenContent(page: string, pattern: string, context: string) {
    this.brokenContent.push({ page, pattern, context });
  }

  public recordConsoleLog(page: string, type: 'error' | 'warning', text: string) {
    this.consoleErrors.push({ page, type, text });
  }

  public recordNetworkError(page: string, url: string, status: number) {
    this.networkErrors.push({ page, url, status });
  }

  public recordManualCheck(category: string, item: string, reason: string) {
    this.manualChecks.push({ category, item, reason });
  }

  public recordDegraded(category: string, page: string, title: string, detail: string) {
    this.degradedItems.push({ category, page, title, detail });
  }

  public recordCriticalFailure(category: string, page: string, title: string, error: string, severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'CRITICAL', isKnown = false) {
    this.criticalFailures.push({ category, page, title, error, severity, isKnown });
  }

  public recordObservation(obs: string) {
    this.observations.push(obs);
  }
}

export const qaCollector = QaCollector.getInstance();
