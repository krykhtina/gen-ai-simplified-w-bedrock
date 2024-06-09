import axios from "axios";
import { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));
    // Log the event argument for debugging and for use in local development.

    const apiPath = event.apiPath;
    const baseUrl = " https://1v8lhcb0v2.execute-api.eu-central-1.amazonaws.com/dev"

    let apiResponse;

    if (apiPath === '/properties') {
        const propertyId = event.parameters[0].value;
        const url = `${baseUrl}/properties/${propertyId}`;
        
        apiResponse = await axios.get(url).then((response: any) => {
            console.log(`API response: ${response.data}`);
            return response.data;
        });
    } else if (apiPath == '/properties/{propertyId}/availability')  {
        const propertyId = event.parameters[0].value;
        const endDate = event.parameters[1].value;
        const startDate = event.parameters[2].value;
        const url = `${baseUrl}/properties/${propertyId}/availability`;
        
        apiResponse = await axios.get(url, {
			params: {
				propertyId: propertyId,
				endDate: endDate,
				startDate: startDate,
			}
        }).then((response: any) => {
            console.log(`API response: ${response.data}`);
            return response.data;
        });
    } else if (apiPath == '/properties/search')  {
        const properties = event.requestBody.content["application/json"].properties;
        const city = properties[0].value;
        const guests = properties[1].value;
        const country = properties[2].value;
        const bedrooms = properties[3].value;
        const url = `${baseUrl}/properties/search`;
        
        apiResponse = await axios.post(url, {
            city: city,
            country: country,
            bedrooms: bedrooms,
            guests: guests
        }).then((response: any) => {
            console.log(`API response: ${response.data}`);
            return response.data;
        });
    } else if (apiPath == '/bookings')  {
        const properties = event.requestBody.content["application/json"].properties;
        const customerName = properties[0].value;
        const propertyId = properties[1].value;
        const contactDetails = properties[2].value;
        const endDate = properties[3].value;
        const startDate = properties[4].value;
        const paymentInformation = properties[5].value;
        const url = `${baseUrl}/properties/search`;
        
        apiResponse = await axios.post(url, {
            customerName: customerName,
            propertyId: propertyId,
            contactDetails: contactDetails,
            endDate: endDate,
            startDate: startDate,
            paymentInformation: paymentInformation,
        }).then((response: any) => {
            console.log(`API response: ${response.data}`);
            return response.data;
        });
    }
    else if (apiPath === '/booking') {
        const bookingId = event.parameters[0].value;
        const url = `${baseUrl}/properties/${bookingId}`;
        
        apiResponse = await axios.delete(url).then((response: any) => {
            console.log(`API response: ${response.data}`);
            return response.data;
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

