export const convertFlatToTree = (array = [], idFieldName, parentIdFieldName, childrenFieldName) => {
  const cloned = array.slice();
  
    for (let i = cloned.length - 1; i > -1 ; i--) {
      const parentId = cloned[i][parentIdFieldName];
      if (parentId) {
        const filtered = array.filter(elem => elem[idFieldName].toString() === parentId.toString());
        if (filtered.length) {
          const parent = filtered[0];
          parent[childrenFieldName]
            ? parent[childrenFieldName].unshift(cloned[i])
            : parent[childrenFieldName] = [cloned[i]];
        }
        cloned.splice(i, 1);
      }
    }

    return cloned;
}