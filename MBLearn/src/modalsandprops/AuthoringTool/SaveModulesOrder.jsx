const SavedModulesOrder = async ({ modules, courseId, setSavingItems, setChangedOrder, setModules }) => {
  try {
    setSavingItems(true);

    const modulesWithOrder = modules.map((module, index) => ({
      ...module,
      currentOrderPosition: index,
    }));

    const payload = { modules: modulesWithOrder, courseId };

    const response = await axiosClient.post('/postModuleItem', payload);
    
    setSavingItems(false);
    setChangedOrder(false);
    setModules(modulesWithOrder.map(m => ({ ...m, unsave: false })));

    console.log("payload", payload);
    return response;
  } catch (error) {
    setSavingItems(false);
    console.error("Error submitting form:", error);
    throw error;
  }
};
