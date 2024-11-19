"use strict";

const { HolidayType } = require("../models/holiday/holiday-type-enum");

module.exports = {
  async up(queryInterface) {
    const holidayData = [
      {
        "date": "2018-01-01",
        "day": "Monday",
        "holiday": "New Year's Day (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-01-14",
        "day": "Sunday",
        "holiday": "Makar Sankranti (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-01-22",
        "day": "Monday",
        "holiday": "Basant Panchami / Sri Panchami (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-01-26",
        "day": "Friday",
        "holiday": "Republic Day (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-01-31",
        "day": "Wednesday",
        "holiday": "Guru Ravidas's Birthday (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-02-10",
        "day": "Saturday",
        "holiday": "Swami Dayananda Saraswati Jayanti (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-02-14",
        "day": "Wednesday",
        "holiday": "Maha Shivaratri (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-02-19",
        "day": "Monday",
        "holiday": "Shivaji Jayanti (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-03-01",
        "day": "Thursday",
        "holiday": "Holika Dahan/Dolyatra (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-03-02",
        "day": "Friday",
        "holiday": "Holi (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-03-18",
        "day": "Sunday",
        "holiday": "Chaitra Sukladi/Gudi Padava/Ugadi/Cheti Chand (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-03-25",
        "day": "Sunday",
        "holiday": "Ram Navami (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-03-29",
        "day": "Thursday",
        "holiday": "Mahavir Jayanti (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-03-30",
        "day": "Friday",
        "holiday": "Good Friday (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-04-01",
        "day": "Sunday",
        "holiday": "Easter Sunday (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-04-14",
        "day": "Saturday",
        "holiday": "Vaisakhi/Vishu/Mesadi (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-04-15",
        "day": "Sunday",
        "holiday": "Vaisakhadi(Bengal)/Bahag Bihu (Assam) (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-04-30",
        "day": "Monday",
        "holiday": "Buddha Purnima (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-05-09",
        "day": "Wednesday",
        "holiday": "Guru Rabindranath's Birthday (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-06-15",
        "day": "Friday",
        "holiday": "Jamat-Ul-Vida (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-06-16",
        "day": "Saturday",
        "holiday": "Idu'l Fitr (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-07-14",
        "day": "Saturday",
        "holiday": "Rath Yatra (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-08-15",
        "day": "Wednesday",
        "holiday": "Independence day (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-08-17",
        "day": "Friday",
        "holiday": "Parsi New Year's day/Nauraj (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-08-22",
        "day": "Wednesday",
        "holiday": "Id-ul-Zuha (Bakrid) (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-08-25",
        "day": "Saturday",
        "holiday": "Onam or Thiru Onam Day (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-08-26",
        "day": "Sunday",
        "holiday": "Raksha Bandhan (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-09-03",
        "day": "Monday",
        "holiday": "Janmashtami (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-09-13",
        "day": "Thursday",
        "holiday": "Vinayaka Chaturthi/Ganesh Chaturthi (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-09-21",
        "day": "Friday",
        "holiday": "Muharram (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-10-02",
        "day": "Tuesday",
        "holiday": "Mahatma Gandhi's Birthday (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-10-16",
        "day": "Tuesday",
        "holiday": "Dussehra (Maha Saptami) (Additional) (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-10-17",
        "day": "Wednesday",
        "holiday": "Dussehra (Maha Ashtami) (Additional) (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-10-18",
        "day": "Thursday",
        "holiday": "Dussehra (Maha Navmi) (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-10-19",
        "day": "Friday",
        "holiday": "Dussehra (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-10-24",
        "day": "Wednesday",
        "holiday": "Maharishi Valmiki's Birthday (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-10-27",
        "day": "Saturday",
        "holiday": "Karaka Chaturthi (Karva Chouth) (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-11-06",
        "day": "Tuesday",
        "holiday": "Deepavali (South India) (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-11-07",
        "day": "Wednesday",
        "holiday": "Diwali (Deepavali) (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-11-08",
        "day": "Thursday",
        "holiday": "Govardhan Puja (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-11-09",
        "day": "Friday",
        "holiday": "Bhai Duj (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-11-13",
        "day": "Tuesday",
        "holiday": "Pratihar Sashthi or Surya Sashthi (Chhat Puja) (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-11-21",
        "day": "Wednesday",
        "holiday": "Milad-un-Nabi or Id-e-Milad (Birthday of Prophet Mohammad) (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-11-23",
        "day": "Friday",
        "holiday": "Gur'u Nanak's Birthday (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      },
      {
        "date": "2018-11-24",
        "day": "Saturday",
        "holiday": "Guru Teg Bahadur's Martyrdom Day (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-12-24",
        "day": "Monday",
        "holiday": "Christmas Eve (R)",
        "holiday_type": HolidayType.ENUM.OPTIONAL
      },
      {
        "date": "2018-12-25",
        "day": "Tuesday",
        "holiday": "Christmas Day (G)",
        "holiday_type": HolidayType.ENUM.PUBLIC
      }
    ];

    await queryInterface.bulkInsert("holiday", holidayData.map((holiday) => ({
      name: holiday.holiday,
      description: holiday.holiday,
      date_observed: new Date(holiday.date),
      type: holiday.holiday_type
    })));
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete("holiday", null, { transaction });
    });
  }
};
