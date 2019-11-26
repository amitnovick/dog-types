function doesSupportDynamicImport() {
  try {
    // eslint-disable-next-line
    new Function('import("")');
    return true;
  } catch (err) {
    return false;
  }
}

export default doesSupportDynamicImport;
