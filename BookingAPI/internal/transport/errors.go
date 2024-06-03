package transport

// create a error message variable
const ErrorMethodNotAllowed = "method not allowed"

// Create a struct to hold aws error as string
type ErrorBody struct {
	ErrorMsg string `json:"error,omitempty"`
}
