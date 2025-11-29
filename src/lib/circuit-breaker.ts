type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
    failureThreshold?: number;
    successThreshold?: number;
    timeout?: number;
}

class CircuitBreaker {
    private state: CircuitState = 'CLOSED';
    private failureCount = 0;
    private successCount = 0;
    private nextAttempt = Date.now();

    constructor(
        private name: string,
        private options: CircuitBreakerOptions = {}
    ) {
        this.options = {
            failureThreshold: 5,
            successThreshold: 2,
            timeout: 60000, // 1 minute
            ...options
        };
    }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                throw new Error(`Circuit breaker ${this.name} is OPEN`);
            }
            this.state = 'HALF_OPEN';
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess() {
        this.failureCount = 0;

        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= this.options.successThreshold!) {
                this.state = 'CLOSED';
                this.successCount = 0;
            }
        }
    }

    private onFailure() {
        this.failureCount++;
        this.successCount = 0;

        if (this.failureCount >= this.options.failureThreshold!) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.options.timeout!;
        }
    }

    getState() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            nextAttempt: this.nextAttempt
        };
    }
}

// Export circuit breakers for different services
export const nowPaymentsCircuit = new CircuitBreaker('nowpayments', {
    failureThreshold: 5,
    timeout: 120000 // 2 minutes
});

export const guardianApiCircuit = new CircuitBreaker('guardian-api', {
    failureThreshold: 3,
    timeout: 60000 // 1 minute
});
