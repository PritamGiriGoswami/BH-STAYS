function isEmail(value) {
  return (
    typeof value === 'string' &&
    value.trim().length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
  );
}

function isDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validatePositiveInt(value) {
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return { ok: true, value: parseInt(value, 10) };
  }
  return { ok: false };
}

function isValidCategory(value) {
  return ['apartments', 'resorts', 'villas', 'cottages', 'cabins', 'rooms'].includes(value);
}

module.exports = { isEmail, isDateString, validatePositiveInt, isValidCategory };