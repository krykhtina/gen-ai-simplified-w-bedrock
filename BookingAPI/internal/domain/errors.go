package domain

type Error string

func (err Error) Error() string {
	return string(err)
}

const (
	ErrPropertyNotFound     = Error("property not found")
	ErrBookingNotFound      = Error("booking not found")
	ErrPropertyNotAvailable = Error("property not available")
)
