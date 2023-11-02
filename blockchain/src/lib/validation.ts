/**
 * Validation class
 *
 */
export default class Validation {
  success: boolean;
  message: string;

  /**
   * Create a new Validation object
   *
   * @param success true if validation was successful
   * @param message the validation message if validation failed
   */
  constructor(success: boolean = true, message: string = 'That is All OK!') {
    this.success = success;
    this.message = message;
  }
}
