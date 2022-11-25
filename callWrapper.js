/*
 * My take on a basic bin-wrapper. Did not like the workflow or lack of
 * documentation on other bin-wrapper-like libraries
 */

module.exports = (func, ...initialArgs) => {
  return {
    run: (...passedArgs) => func.call(this, ...initialArgs, ...passedArgs)
  };
};
