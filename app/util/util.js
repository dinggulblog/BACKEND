import { randomBytes } from 'crypto';

/**
 * Convert a flat array to tree structure array
 * @param {Array} array
 * @param {String} idFieldName
 * @param {String} parentIdFieldName
 * @param {String} childrenFieldName
 * @returns An array of tree structure
 */
export const convertFlatToTree = (array = [], idFieldName, parentIdFieldName, childrenFieldName, childrenFieldCountName) => {
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
          parent[childrenFieldCountName] = parent[childrenFieldName].length
        }
        cloned.splice(i, 1);
      }
    }

    return cloned;
};

/**
 * Generates an IP string with the host part obscured
 * @param {String} ip
 * @returns IP string
 */
export const securedIPString = (ip = '') => {
  const IP = ip.split('.');
  return IP.shift() + '.' + IP.shift() + '.' + '***.***';
};

/**
 * Generates a random string of length characters by creating random bytes
 * @param {Number} length
 * @returns A string of length characters
 */
export const randomString = (length = 10) => {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')   // convert to hexadecimal format
    .slice(0, length); // return required number of characters
};
