export class FeedGeneratorMetrics {
    feedCount: number
    lastFeedGenerationTime: number
  
    constructor() {
      this.feedCount = 0
      this.lastFeedGenerationTime = 0
    }
  
    public incrementFeedCount(num: number = 1) {
      this.feedCount += num
    }
  
    public setLastFeedGenerationTime(time: number) {
      this.lastFeedGenerationTime = time
    }
  
    public getMetrics() {
      return {
        feedCount: this.feedCount,
        lastFeedGenerationTime: this.lastFeedGenerationTime,
      }
    }
  }

  