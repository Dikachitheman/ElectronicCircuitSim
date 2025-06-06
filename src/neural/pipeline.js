
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

class Node {
    constructor(funcMap, execute, args) {
        this.funcMap = funcMap;
        this.execute = execute; // Key
        this.args = args;
        this.head = null;
        this.tail = null;
    }

    async run() {
        // await this.execute({ctx: this.args.ctx, input: this.args.input, id: this.args.id});
        return await this.funcMap[this.execute]({ctx: this.args.ctx, input: this.args.input, id: this.args.id})
    }
}

class Channel {
    constructor() {
        this.head = null;
        this.tail = null;
        this.start = null;
        this.last = null;
        this.nodes = [];
    }

    append(node) {
        this.nodes.push(node)
    }

    chain(node) {
        if (!this.start) {
            this.start = node;
            this.last = node;
            node.head = null;
        } else {
            this.last.tail = node;
            node.head = this.last;
            this.last = node;
        }
    }

    getNodes() {
        console.log(this.nodes)
    }

    getLinkedNodes() {
        let proceed = true
        let start = this.start
        while(proceed) {
            console.log(start)
            start = start.tail

            if (!start) {
                proceed = false
            }
        }
    }

    process() {
        let a = []
        for(let node of this.nodes) {
            // await node.run()
            a.push({key: node.execute, args: node.args})
        }

        return a
    }

    async run() {
        let currentNode = this.start
        while(currentNode) {
            // await currentNode.run()
            this.nodes.push(currentNode)
            currentNode = currentNode.tail
        }

        // await this.process()
    }
}

export class Pipeline {
    constructor(funcMap) {
        this.channels = [];
        this.contextManager = new ContextManager();
        this.functions = funcMap;
    }

    compose(functionNames) {
        const channel = new Channel();

        functionNames.forEach(d => {

            let split = d.input.split(" $")
            let input = split.slice(1)
            let id = d.id

            if (!this.functions[split[0]]) {
                throw new Error(`Function "${split[0]}" not registered`);
            }
            
            const node = new Node(this.functions, split[0], {ctx: this.contextManager, input, id});
            channel.chain(node);
        });

        this.channels.push(channel);
        // channel.getLinkedNodes() //DEBUG: logs

        return channel;
    }

    
    async run() {
        if (this.channels.length === 0) {
            throw new Error('No channels in pipeline');
        }

        let b=[]
        for (let ch of this.channels) {
            await ch.run()
            b.push( ch.process())
        }
        // console.log("ctx", this.contextManager)
        this.contextManager.clear()

        console.log(b)
        return b
    }
}

export const Execute = (pipeline, funcMap) => {
    for(let ar=0; ar<pipeline.length; ar++) {
        for (let p = 0; p<pipeline[ar].length; p++) {
            funcMap[pipeline[ar][p].key]({ctx: pipeline[ar][p].args.ctx, input: pipeline[ar][p].args.input, id: pipeline[ar][p].args.id})
        }
    }
}

// const pipeline = new Pipeline();
// pipeline.compose(['fetchData', 'processData', 'saveData', 'test']);
// pipeline.run()

