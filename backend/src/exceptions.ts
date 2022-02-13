export class InputError extends Error {
    constructor(...params: unknown[]) {
        if(params.length > 0 && typeof params[0] === "string") {
            super(params[0]);
        } else {
            super();
        }
        
        if(Error.captureStackTrace !== undefined) {
            Error.captureStackTrace(this, InputError)
        }
  
        this.name = 'InputError'
    }
}