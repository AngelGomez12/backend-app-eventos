(async () => {
  if (process.env.NODE_ENV === "production" || process.env.CI === "true") {
    return;
  }
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const huskyModule = await import("husky");
  const husky = huskyModule.default;
  // eslint-disable-next-line no-console
  console.log(husky());
})();
