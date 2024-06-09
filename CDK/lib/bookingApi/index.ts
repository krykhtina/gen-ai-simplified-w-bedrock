import axios from "axios";
import { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));
    // Log the event argument for debugging and for use in local development.

    const apiPath = event.apiPath;
    const baseUrl = "https://1v8lhcb0v2.execute-api.eu-central-1.amazonaws.com/dev"

    let apiResponse;

    if (apiPath === '/properties') {
        const propertyId = event.parameters[0]?.value;
        const url = `${baseUrl}/properties/${propertyId}`;
        
        apiResponse = await axios.get(url).then((response: any) => {
            console.log(`API response: ${response.data}`);
            return response.data;
        }).catch((error: any) => {
            console.log(`Call to API failed, error: ${error}`)
            return "Call to the API failed."
        });
    } else if (apiPath == '/properties/{propertyId}/availability')  {
        const propertyId = event.parameters[0]?.value || undefined;;
        const endDate = event.parameters[1]?.value || undefined;;
        const startDate = event.parameters[2]?.value || undefined;;
        const url = `${baseUrl}/properties/${propertyId}/availability`;
        
        apiResponse = await axios.get(url, {
			params: {
                ...(propertyId && {propertyId: propertyId}),
                ...(endDate && {endDate: endDate}),
                ...(startDate && {startDate: startDate}),
			}
        }).then((response: any) => {
            console.log(`API response: ${response.data}`);
            return response.data;
        }).catch((error: any) => {
            console.log(`Call to API failed, error: ${error}`)
            return "Call to the API failed."
        });
    } else if (apiPath == '/properties/search')  {
        const properties = event.requestBody.content["application/json"].properties;
        const city = properties[0]?.value || undefined;
        const guests = properties[1]?.value || undefined;
        const country = properties[2]?.value || undefined;
        const bedrooms = properties[3]?.value || undefined;
        const url = `${baseUrl}/properties/search`;
        
        apiResponse = await axios.post(url, {
            ...(city && {city: city}),
            ...(country && {country: country}),
            ...(bedrooms && {bedrooms: bedrooms}),
            ...(guests && {guests: guests}),
        }).then((response: any) => {
            console.log(`API response: ${response.data}`);
            return response.data;
        }).catch((error: any) => {
            console.log(`Call to API failed, error: ${error}`)
            return "Call to the API failed."
        });
    } else if (apiPath == '/bookings')  {
        const properties = event.requestBody.content["application/json"].properties;
        const customerName = properties[0]?.value || undefined;
        const propertyId = properties[1]?.value || undefined;
        const contactDetails = properties[2]?.value || undefined;
        const endDate = properties[3]?.value || undefined;
        const startDate = properties[4]?.value || undefined;
        const paymentInformation = properties[5]?.value || undefined;
        const url = `${baseUrl}/bookings`;
        
        apiResponse = await axios.post(url, {
            ...(customerName && {customerName: customerName}),
            ...(propertyId && {propertyId: parseInt(propertyId)}),
            ...(contactDetails && {contactDetails: JSON.parse(contactDetails)}),
            ...(endDate && {endDate: endDate}),
            ...(startDate && {startDate: startDate}),
            ...(paymentInformation && {paymentInformation: JSON.parse(paymentInformation)}),
        }).then((response: any) => {
            console.log(`API response: ${response.data}`);
            return response.data;
        }).catch((error: any) => {
            console.log(`Call to API failed, error: ${error}`)
            return "Call to the API failed."
        });
    }
    else if (apiPath === '/booking') {
        const bookingId = event.parameters[0]?.value;
        const url = `${baseUrl}/booking/${bookingId}`;
        
        apiResponse = await axios.delete(url).then((response: any) => {
            console.log(`API response: ${response.data}`);
            return response.data;
        }).catch((error: any) => {
            console.log(`Call to API failed, error: ${error}`)
            return "Call to the API failed."
        });
    }

    let result = {
        messageVersion: '1.0',
        response: {
            actionGroup: event.actionGroup,
            apiPath: event.apiPath,
            httpMethod: event.httpMethod,
            httpStatusCode: 200,
            responseBody: {
                'application/json': {
                    body: apiResponse,
                },
            },
            sessionAttributes: {},
            promptSessionAttributes: {},
        },
    };

    console.log(result);
    return result;
};

