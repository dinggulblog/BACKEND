import { accessSync, unlinkSync, constants } from 'fs';
import { join } from 'path';

/**
 * Convert a flat array to tree structure array
 * @param {Array} array
 * @param {String} idFieldName 
 * @param {String} parentIdFieldName 
 * @param {String} childrenFieldName 
 * @returns An array of tree structure
 */
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

/**
 * Delete the files if an error occurs after the files are uploaded
 * @param {Object} fileObject requested file object
 * @returns undefined
 */
export const deleteMissingFiles = (fileObject) => {
  const { file, files } = fileObject;

  if (file) {
    const filePath = join(__dirname, 'uploads', file.filename);
    accessSync(filePath, constants.F_OK);
    unlinkSync(filePath);
  }

  if (files && files.length) {
    files.forEach(file => {
      const filePath = join(__dirname, 'uploads', file.filename);
      accessSync(filePath, constants.F_OK);
      unlinkSync(filePath);
    })
  }
}

export const getSecuredIPString = (ip = '') => {
  const IP = ip.split();
  return IP.shift() + '.' + IP.shift() + '.' + '***.***';
}