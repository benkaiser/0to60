var times_lookup = [];
if (times) {
  times.forEach(make => {
    make.models.forEach(model => {
      Object.entries(model.variants).forEach(([name, variant]) => {
        times_lookup.push({
          ...variant,
          name: name,
          key: name.toLowerCase(),
          make: make,
        });
      });
    });
  });
}