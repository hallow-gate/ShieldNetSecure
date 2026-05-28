import { ThreatInfo, ScanResult, ThreatIndicators, DomainInfo } from '../types';
import { URLUtils } from '../utils/url-utils';
import { DomainChecker } from '../utils/domain-checker';
import { ThreatScoring } from '../utils/threat-scoring';

export class SecurityEngine {
  private static instance: SecurityEngine;
  private phishingPatterns: RegExp[];
  private scamKeywords: string[];
  private casinoDomains: Set<string>;
  private fakeBankingPatterns: RegExp[];

  private constructor() {
    this.initializePatterns();
  }

  static getInstance(): SecurityEngine {
    if (!SecurityEngine.instance) {
      SecurityEngine.instance = new SecurityEngine();
    }
    return SecurityEngine.instance;
  }

  private initializePatterns() {
    // Phishing patterns
    this.phishingPatterns = [
      /secure.*login/i,
      /verify.*account/i,
      /update.*payment/i,
      /confirm.*identity/i,
      /limited.*time.*offer/i,
      /account.*suspended/i,
      /unusual.*activity/i,
      /click.*here.*secure/i,
      /bank.*alert/i,
      /urgent.*action/i,
    ];

    // Scam keywords
    this.scamKeywords = [
      'congratulations',
      'winner',
      'prize',
      'free',
      'bonus',
      'limited offer',
      'act now',
      'exclusive deal',
      'risk free',
      'guaranteed',
      'casino',
      'gambling',
      'bet',
      'lottery',
      'jackpot',
      'slots',
      'poker',
      'roulette',
      'blackjack',
      'wagering',
      'deposit match',
      'no deposit',
      'free spins',
      'vip program',
      'high roller',
    ];

    // Casino domains
    this.casinoDomains = new Set([
      'casino.com',
      'bet365.com',
      '888casino.com',
      'pokerstars.com',
      'betway.com',
      'williamhill.com',
      'betfair.com',
      'unibet.com',
      'bwin.com',
      'partycasino.com',
      'betvictor.com',
      'coral.co.uk',
      'ladbrokes.com',
      'paddypower.com',
      'skybet.com',
      'betfred.com',
      'boylesports.com',
      '32red.com',
      'casumo.com',
      'leovegas.com',
      'mrgreen.com',
      'royalvegas.com',
      'spinpalace.com',
      'rubyfortune.com',
      'jackpotcity.com',
      'guts.com',
      'rizk.com',
      'videoslots.com',
      'thrills.com',
      'casinocom.com',
    ]);

    // Fake banking patterns
    this.fakeBankingPatterns = [
      /.*bank.*\.(xyz|top|club|online|site)$/i,
      /.*secure.*banking.*\.(xyz|top|club)$/i,
      /.*login.*bank.*\.(xyz|top|club)$/i,
      /.*verify.*account.*\.(xyz|top|club)$/i,
      /.*chase.*\.(xyz|top|club)$/i,
      /.*wellsfargo.*\.(xyz|top|club)$/i,
      /.*bankofamerica.*\.(xyz|top|club)$/i,
      /.*citibank.*\.(xyz|top|club)$/i,
    ];
  }

  async scanURL(url: string): Promise<ScanResult> {
    const expandedUrl = await URLUtils.expandShortUrl(url);
    const urlInfo = URLUtils.parseURL(expandedUrl);
    const domainInfo = await this.analyzeDomain(urlInfo.domain);
    const redirects = await URLUtils.traceRedirects(expandedUrl);
    const indicators = this.detectThreatIndicators(expandedUrl, urlInfo.domain);
    const threatScore = ThreatScoring.calculateScore(indicators, domainInfo);
    const riskLevel = ThreatScoring.getRiskLevel(threatScore);

    return {
      url: expandedUrl,
      isThreat: threatScore > 30,
      riskLevel,
      threatScore,
      domainInfo,
      redirects,
      indicators,
      timestamp: new Date(),
    };
  }

  private async analyzeDomain(domain: string): Promise<DomainInfo> {
    const tld = domain.split('.').pop() || '';
    const suspiciousTLDs = ['xyz', 'top', 'club', 'online', 'site', 'tk', 'ml', 'ga', 'cf'];
    const isSuspicious = suspiciousTLDs.includes(tld) || 
                        DomainChecker.isSuspiciousTLD(domain) ||
                        DomainChecker.isFakeDomain(domain);
    
    const isNew = await DomainChecker.isNewDomain(domain);
    const isCasino = this.casinoDomains.has(domain.toLowerCase()) ||
                    DomainChecker.isCasinoSite(domain);

    return {
      domain,
      tld,
      isNew,
      isSuspicious: isSuspicious || isCasino,
    };
  }

  private detectThreatIndicators(url: string, domain: string): ThreatIndicators {
    const urlLower = url.toLowerCase();
    const domainLower = domain.toLowerCase();

    return {
      hasPhishingKeywords: this.phishingPatterns.some(pattern => pattern.test(url)),
      isShortenedUrl: URLUtils.isShortenedUrl(url),
      hasRedirect: URLUtils.hasRedirectChain(url),
      isFakeDomain: DomainChecker.isFakeDomain(domain) ||
                   this.fakeBankingPatterns.some(pattern => pattern.test(domain)),
      matchesKnownPattern: this.scamKeywords.some(keyword => urlLower.includes(keyword)),
      hasSuspiciousTLD: ['xyz', 'top', 'club', 'online', 'site'].includes(
        domain.split('.').pop() || ''
      ),
      isCasinoRelated: this.casinoDomains.has(domainLower) ||
                      DomainChecker.isCasinoSite(domain) ||
                      this.scamKeywords.some(keyword => 
                        urlLower.includes(keyword) && 
                        ['casino', 'gambling', 'bet', 'poker', 'slots'].some(term => 
                          urlLower.includes(term)
                        )
                      ),
      isBankingImpersonation: this.fakeBankingPatterns.some(pattern => pattern.test(domain)),
    };
  }

  async scanSMSMessage(message: string, sender: string): Promise<ThreatInfo | null> {
    const urls = URLUtils.extractURLs(message);
    
    if (urls.length === 0) return null;

    for (const url of urls) {
      const scanResult = await this.scanURL(url);
      
      if (scanResult.isThreat) {
        const threatType = this.determineThreatType(scanResult, message);
        
        return {
          id: Date.now().toString(36) + Math.random().toString(36),
          type: threatType,
          severity: scanResult.riskLevel === 'critical' ? 'critical' : 
                   scanResult.riskLevel === 'dangerous' ? 'high' : 'medium',
          url: scanResult.url,
          domain: scanResult.domainInfo.domain,
          riskScore: scanResult.threatScore,
          timestamp: new Date(),
          source: 'sms',
          description: this.generateThreatDescription(scanResult),
          indicators: this.getThreatIndicators(scanResult),
          recommendedAction: this.getRecommendedAction(scanResult),
        };
      }
    }

    return null;
  }

  private determineThreatType(scanResult: ScanResult, message: string): ThreatInfo['type'] {
    if (scanResult.indicators.isCasinoRelated) return 'casino';
    if (scanResult.indicators.isBankingImpersonation) return 'impersonation';
    if (scanResult.indicators.isFakeDomain) return 'fraud';
    if (scanResult.indicators.hasPhishingKeywords) return 'phishing';
    if (scanResult.indicators.matchesKnownPattern) return 'scam';
    return 'malware';
  }

  private generateThreatDescription(scanResult: ScanResult): string {
    if (scanResult.indicators.isCasinoRelated) {
      return 'Casino/gambling website detected. These sites often involve financial risks and potential scams.';
    }
    if (scanResult.indicators.isBankingImpersonation) {
      return 'Fake banking website detected. This site is impersonating a legitimate financial institution to steal credentials.';
    }
    if (scanResult.indicators.hasPhishingKeywords) {
      return 'Phishing attempt detected. This link is trying to steal your personal information.';
    }
    return 'Suspicious website detected. Proceed with caution.';
  }

  private getThreatIndicators(scanResult: ScanResult): string[] {
    const indicators: string[] = [];
    
    if (scanResult.indicators.hasPhishingKeywords) indicators.push('Phishing keywords detected');
    if (scanResult.indicators.isShortenedUrl) indicators.push('Shortened URL');
    if (scanResult.indicators.hasRedirect) indicators.push('Redirect chain detected');
    if (scanResult.indicators.isFakeDomain) indicators.push('Fake domain');
    if (scanResult.indicators.matchesKnownPattern) indicators.push('Matches scam patterns');
    if (scanResult.indicators.hasSuspiciousTLD) indicators.push('Suspicious TLD');
    if (scanResult.indicators.isCasinoRelated) indicators.push('Casino/gambling site');
    if (scanResult.indicators.isBankingImpersonation) indicators.push('Banking impersonation');
    if (scanResult.domainInfo.isNew) indicators.push('Newly registered domain');
    
    return indicators;
  }

  private getRecommendedAction(scanResult: ScanResult): string {
    if (scanResult.indicators.isBankingImpersonation) {
      return 'Do not enter any banking credentials. Report this URL to your bank immediately.';
    }
    if (scanResult.indicators.isCasinoRelated) {
      return 'Avoid sharing personal or financial information with this site. Consider blocking the sender.';
    }
    if (scanResult.indicators.hasPhishingKeywords) {
      return 'Do not click this link. Delete the message and block the sender.';
    }
    return 'Exercise caution. Verify the source before proceeding.';
  }
}
