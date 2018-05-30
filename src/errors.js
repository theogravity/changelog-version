// https://gist.github.com/slavafomin/b164e3e710a6fc9352c934b9073e7216

export class UnreleasedEntryNotFound extends Error {
  constructor (releaseTag, customFailMsg = null) {
    // Calling parent constructor of base Error class.
    if (customFailMsg) {
      super(customFailMsg)
    } else {
      super(`The changelog file did not contain the specified unreleasedTag: "${releaseTag}". Did
you prepare the changelog and add in your release notes?`)
    }

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor)
  }
}
