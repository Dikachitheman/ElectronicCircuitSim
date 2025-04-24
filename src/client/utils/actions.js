export const funcMap = {
    "fetchData": async ({ ctx, input }) => {
        console.log("fetchData ctx", input);
        return input;
    },
    "processData": async ({ ctx, input }) => {
        console.log("processData ctx");
        return input;
    },
    "saveData": async ({ ctx, input }) => {
        console.log("saveData ctx");
        return input;
    }, 
    "test": async () => {
        // Access store outside React
        const { changeOrientation, isVerticalz } = useStore.getState();
        console.log("Before change:", isVerticalz);
    
        changeOrientation();
    
        const newOrientation = useStore.getState().isVerticalz;
        console.log("After change:", newOrientation);
    
        return newOrientation;
      }
};