'use strict';

module.exports = class DateTimeCounter {
  /**
   * @class
   * @classdesc To manage date time counter
   * 
   * @param {string} expDateTime Expiration date time. ISO format, e.g., 2023-01-01T23:59:59
   * @param {string} [fromDate] Count from date time. If not provided, current date time will be used
   */
  constructor(expDateTime, fromDate) {
    const fromDateValue = fromDate ? new Date(fromDate).valueOf() : Date.now();
    const toDateValue = new Date(expDateTime).valueOf();
  
    let remainingSeconds = Math.round((toDateValue - fromDateValue) / 1000);
  
    const days = Math.floor(remainingSeconds / 86400);
    remainingSeconds =  remainingSeconds - days * 86400;
  
    const hours = Math.floor((remainingSeconds / 3600));
    remainingSeconds =  remainingSeconds - hours * 3600;
  
    const minutes = Math.floor(remainingSeconds / 60);
    remainingSeconds =  remainingSeconds - minutes * 60;
  
    this.value = { days, hours, minutes, seconds: remainingSeconds };
  }

  /**
   * Get days, hours, minutes and seconds string value
   * 
   * @param {boolean} [padZero=true] Add zero if the value is 1 digit. E.g., `1` -> `01`. Default is `true`
   * @returns {object} Object with `days`, `hours`, `minutes` and `seconds` value in string
   */
  getStringValue(padZero = true) {
    const days = this.value.days.toString();
    const hours = this.value.hours.toString();
    const minutes = this.value.minutes.toString();
    const seconds = this.value.seconds.toString();

    return {
      days: padZero && days.length < 2 ? "0" + days : days,
      hours: padZero && hours.length < 2 ? "0" + hours: hours,
      minutes: padZero && minutes.length < 2 ? "0" + minutes: minutes,
      seconds: padZero && seconds.length < 2 ? "0" + seconds: seconds
    }
  }

  /**
   * Reset the counter
   */
  reset() {
    this.value = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  /**
   * Number of days down
   * 
   * @param {number} num Number of days to be subtracted from counter
   */
  dayDown(num) {
    const newDays = this.value.days - num;
    this.value.days = newDays > 0 ? newDays : 0;

    if (newDays < 0) { this.reset(); }
  }

  /**
   * Number of hours down
   * 
   * @param {number} num Number of hours to be subtracted from counter
   */
  hourDown(num) {
    let newHours = this.value.hours - num;

    while (this.value.days > 0 && newHours < 0) {
      this.dayDown(1);
      this.value.hours = this.value.hours + 24;
      newHours = this.value.hours - num;
    }
    
    this.value.hours = newHours > 0 ? newHours : 0;
  }

  /**
   * Number of minutes down
   * 
   * @param {number} num Number of minutes to be subtracted from counter
   */
  minuteDown(num) {
    let newMinutes = this.value.minutes - num;

    while ((this.value.days > 0 || this.value.hours > 0) && newMinutes < 0) {
      this.hourDown(1);
      this.value.minutes = this.value.minutes + 60;
      newMinutes = this.value.minutes - num;
    }
    
    this.value.minutes = newMinutes > 0 ? newMinutes : 0;
  }

  /**
   * Number of seconds down
   * 
   * @param {number} num Number of seconds to be subtracted from counter
   */
  secondDown(num) {
    let newSeconds = this.value.seconds - num;

    while ((this.value.days > 0 || this.value.hours > 0 || this.value.minutes > 0) && newSeconds < 0) {
      this.minuteDown(1);
      this.value.seconds = this.value.seconds + 60;
      newSeconds = this.value.seconds - num;
    }
    
    this.value.seconds = newSeconds > 0 ? newSeconds : 0;
  }
}