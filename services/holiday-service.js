const { isValidUUID } = require("../models/common/validator");
const { HolidayType } = require("../models/holiday/holiday-type-enum");
const { holidayRepository } = require("../repositories/holiday-repository");

exports.validateQueryParameters = async (payload) => {
  let { archive = false, order, order_column, organization_uuid, holiday_type, date_observed, date_range } = payload.query;

  // Convert archive string to a boolean
  if (archive === "true" || archive === true) payload.query.archive = true;
  else payload.query.archive = false;

  // Validate and adjust order parameter
  if (order && !(order.toLowerCase() === "asc" || order.toLowerCase() === "desc")) payload.query.order = "DESC";
  else payload.query.order = order?.toUpperCase() || "DESC";

  // Validate and adjust order_column parameter against available columns
  const columns = await holidayRepository.allColumnsName();
  if ((order_column && !columns[order_column]) || !order_column) {
    payload.query.order_column = "updated_at";
  }

  if (holiday_type && !HolidayType.isValidValue(holiday_type)) throw new BadRequestError("Invalid holiday type.", "Invalid holiday type.");

  if (organization_uuid && !isValidUUID(organization_uuid)) throw new BadRequestError("Invalid organization uuid.", "Invalid organization uuid.");

  if (date_observed && !isValidDate(date_observed)) throw new BadRequestError("Invalid date observed.", "Invalid date");

  if (date_range && !Array.isArray(date_range)) {
    payload.query.date_range = date_range.split(',');
  }

  return payload;
};

exports.getFilteredHolidays = async (payload) => {
  payload = await this.validateQueryParameters(payload);
  let { name, holiday_type, date_observed, date_range, page = 1, limit = 10, order, order_column, organization_uuid } = payload.query;

  return holidayRepository.getFilteredHolidays({ name, holiday_type, date_observed, date_range, organization_uuid }, { order_type: order, order_column, page, limit, });
};

exports.createHoliday = async (payload) => {
  return holidayRepository.createHoliday(payload.body);
};

exports.getHolidayById = async (payload) => {
  const { holiday_uuid } = payload.params;
  return holidayRepository.getHolidayById(holiday_uuid);
};

exports.updateHolidayById = async (payload) => {
  const { holiday_uuid } = payload.params;
  const holiday = payload.body;
  const [affected_rows, [response]] = await holidayRepository.updateHolidayById(holiday_uuid, holiday);
  return response;
};

exports.createBulkHolidays = async (payload) => {
  return holidayRepository.createBulkHolidays(payload.body);
}
