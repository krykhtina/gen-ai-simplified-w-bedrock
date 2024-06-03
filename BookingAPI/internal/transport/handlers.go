package transport

import (
	"net/http"

	"github.com/aws/aws-lambda-go/events"
)

// Function that return a Method not allowed error message for those unhandled method types.
func Unhandled() (*events.APIGatewayProxyResponse, error) {
	return Response(http.StatusMethodNotAllowed, ErrorMethodNotAllowed)
}
