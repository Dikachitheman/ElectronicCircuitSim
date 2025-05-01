// // Class to represent a history action
// export class HistoryAction {
//     constructor(action, group, id, branch) {
//       this.action = action;
//       this.group = group;
//       this.id = id;
//       this.branch = branch;
//     }
  
//     // Static method to create an ADD action
//     static createAddAction(group, id, branch) {
//       return new HistoryAction("ADD", group, id, branch);
//     }
  
//     // Static method to create a REMOVE action
//     static createRemoveAction(group, id, branch) {
//       return new HistoryAction("REMOVE", group, id, branch);
//     }
    
//     // Static method to create a MODIFY action
//     static createModifyAction(group, id, branch) {
//       return new HistoryAction("MODIFY", group, id, branch);
//     }
//   }
  
//   // Class to manage history and component information
//   class HistoryManager {
//     constructor(initialHistory = []) {
//       this.history = initialHistory;
//       this.selections = []; // Array of dictionaries for component data
//     }
  
//     // Add selections data
//     setSelections(selections) {
//       this.selections = selections;
//     }
  
//     // Add a history action
//     addToHistory(historyAction) {
//       this.history = [...this.history, historyAction];
//       return this.history;
//     }
  
//     // Get component details by ID
//     getComponentById(id) {
//       return this.selections.find(component => component.id === id);
//     }
  
//     // Get component name by ID
//     getComponentNameById(id) {
//       const component = this.getComponentById(id);
//       return component ? component.name : null;
//     }
  
//     // Get full history
//     getHistory() {
//       return this.history;
//     }
  
//     // Get history with component names
//     getHistoryWithDetails() {
//       return this.history.map(item => {
//         const component = this.getComponentById(item.id);
//         return {
//           ...item,
//           componentName: component ? component.name : 'Unknown',
//           componentDetails: component || {}
//         };
//       });
//     }
//   }
  
//   // Example usage replacing your original code
//   const historyManager = new HistoryManager(history);
//   historyManager.setSelections(selections); // Assume selections is your array of dictionaries
  
//   // Instead of: setHistory([...history, { action: "ADD", group: "comp", id: selectionInstance.id, branch: branch + 1}])
//   // Use:
//   const newHistory = historyManager.addToHistory(
//     HistoryAction.createAddAction("comp", selectionInstance.id, branch + 1)
//   );
//   setHistory(newHistory);
  
  // To get component details
//   const componentDetails = historyManager.getComponentById(selectionInstance.id);
//   console.log(`Added component: ${historyManager.getComponentNameById(selectionInstance.id)}`);

  // Parent class that manages selections
    
// Parent class that manages selections (singleton pattern)
export class HistoryManager {
    static instance = null;
    
    constructor(selections = []) {
      // Implement singleton pattern - only create one instance
      if (HistoryManager.instance) {
        return HistoryManager.instance;
      }
      
      this.selections = selections;
      HistoryManager.instance = this;
    }
    
    // Set or update selections
    setSelections(selections) {
      this.selections = selections;
    }
    
    // Get component details by ID
    getComponentById(id) {
      return this.selections.find(component => component.id === id);
    }
    
    // Get component name by ID
    getComponentNameById(id) {
      // console.log("history m id", id)
      // console.log("xoxo", this.selections)
      const component = this.getComponentById(id);
      return component ? component.component : null;
    }
    
    // Static method to get the singleton instance
    static getInstance(selections) {
      if (!HistoryManager.instance) {
        HistoryManager.instance = new HistoryManager(selections);
      }
      return HistoryManager.instance;
    }
  }
  
  // History class that references the HistoryManager
  export class HistoryClass {
    constructor(action, group, id, branch, live) {
      this.action = action;
      this.group = group;
      this.id = id;
      this.branch = branch;
      this.live = live;
      // Reference the singleton HistoryManager
      this.HistoryManager = HistoryManager.getInstance();
    }
    
    // Get component details by ID using the shared HistoryManager
    getComponentById(id) {
      return this.HistoryManager.getComponentById(id);
    }
    
    // Get component name by ID using the shared HistoryManager
    getComponentNameById(id) {
      return this.HistoryManager.getComponentNameById(id);
    }
    
    // Get details about the component in this history entry
    getComponentDetails() {
      return this.getComponentById(this.id);
    }
    
    getComponentName() {
        return this.getComponentNameById(this.id);
      }
    
    // Create a formatted history entry object
    toHistoryEntry() {
      return {
        action: this.action,
        group: this.group,
        id: this.id,
        branch: this.branch,
        live: this.live,
        comp: this.getComponentName()
      };
    }
  }
