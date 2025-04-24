// Context Manager for storing global state
class ContextManager {
    constructor() {
        this.context = {};
    }

    set(key, value) {
        this.context[key] = value;
    }

    get(key) {
        return this.context[key];
    }

    getAll() {
        return { ...this.context };
    }

    clear() {
        this.context = {};
    }
}

// Node class represents each function in the pipeline
class Node {
    constructor(execute) {
        this.execute = execute;
        this.head = null;
        this.tail = null;
    }

    async run(ctx) {
        return await this.execute(ctx);
    }
}

// Channel class links nodes together
class Channel {
    constructor() {
        this.head = null;
        this.tail = null;
    }

    addNode(node) {
        if (!this.head) {
            this.head = node;
            this.tail = node;
        } else {
            this.tail.tail = node;
            node.head = this.tail;
            this.tail = node;
        }
    }
}

const funcMap = {
    "fetchData": async ({ ctx, input }) => {
        console.log("fetchData ctx");
        return input;
    },
    "processData": async ({ ctx, input }) => {
        console.log("processData ctx");
        return input;
    },
    "saveData": async ({ ctx, input }) => {
        console.log("saveData ctx");
        return input;
    }
};

// Pipeline class manages the execution of the entire pipeline
class Pipeline {
    constructor() {
        this.channels = [];
        this.contextManager = new ContextManager();
        this.functions = funcMap;
    }

    // Register functions that can be called by name
    registerFunction(name, fn) {
        this.functions[name] = fn;
    }

    // Create pipeline from array of function names
    createFromArray(functionNames) {
        const channel = new Channel();

        functionNames.forEach(name => {
            if (!this.functions[name]) {
                throw new Error(`Function "${name}" not registered`);
            }
            
            const node = new Node(this.functions[name]);
            channel.addNode(node);
        });

        this.channels.push(channel);
        return channel;
    }

    // Execute the pipeline
    async execute(initialInput = null) {
        if (this.channels.length === 0) {
            throw new Error('No channels in pipeline');
        }

        let result = initialInput;
        
        for (const channel of this.channels) {
            let currentNode = channel.head;
            
            while (currentNode) {
                // Pass context and result to each function
                result = await currentNode.run({
                    ctx: this.contextManager,
                    input: result
                });
                
                currentNode = currentNode.tail;
            }
        }

        return result;
    }
}

// Example usage
const pipeline = new Pipeline();

// Register functions that can be called by name
pipeline.registerFunction('doFunction', ({ ctx, input }) => {
    console.log('executing doFunction');
    ctx.set('step1', 'completed');
    return input + ' -> doFunction';
});

pipeline.registerFunction('anotherFunction', ({ ctx, input }) => {
    console.log('executing anotherFunction');
    ctx.set('step2', 'completed');
    return input + ' -> anotherFunction';
});

pipeline.registerFunction('thenThisFunction', ({ ctx, input }) => {
    console.log('executing thenThisFunction');
    ctx.set('step3', 'completed');
    return input + ' -> thenThisFunction';
});

// Create pipeline from array of function names
const channel = pipeline.createFromArray(['doFunction', 'anotherFunction', 'thenThisFunction']);

// Execute the pipeline
pipeline.execute('START')
    .then(result => {
        console.log('Final result:', result);
        console.log('Context:', pipeline.contextManager.getAll());
    })
    .catch(error => {
        console.error('Pipeline error:', error);
    });

// Advanced example: Create multiple pipelines with shared context
function createAdvancedPipeline() {
    const pipeline = new Pipeline();
    
    // Example of a more complex function that uses context
    pipeline.registerFunction('fetchData', async ({ ctx, input }) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        const data = { id: 1, name: 'Sample Data' };
        ctx.set('apiData', data);
        return data;
    });
    
    pipeline.registerFunction('processData', ({ ctx, input }) => {
        const apiData = ctx.get('apiData');
        const processed = {
            ...apiData,
            processed: true,
            timestamp: new Date().toISOString()
        };
        ctx.set('processedData', processed);
        return processed;
    });
    
    pipeline.registerFunction('saveData', ({ ctx, input }) => {
        // In real application, this would save to database
        console.log('Saving data:', input);
        ctx.set('saved', true);
        return 'Data saved successfully';
    });
    
    return pipeline;
}

// Usage of advanced pipeline
const advancedPipeline = createAdvancedPipeline();
advancedPipeline. createFromArray(['fetchData', 'processData', 'saveData']);
advancedPipeline.execute()
    .then(result => {
        console.log('Advanced pipeline result:', result);
        console.log('Advanced pipeline context:', advancedPipeline.contextManager.getAll());
    });