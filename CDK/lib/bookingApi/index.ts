import axios from "axios";
import { Handler } from 'aws-lambda';
import { parseString } from "xml2js";

export const handler: Handler = async (event) => {
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));

    const apiPath = event.apiPath;
    const baseUrl = "https://1v8lhcb0v2.execute-api.eu-central-1.amazonaws.com/dev"

    let apiResponse;

    if (apiPath === '/properties') {
        console.log('Processing /properties endpoint');
        const propertyId = event.parameters[0]?.value;
        console.log(`Parameters: propertyId=${propertyId}`);
        const url = `${baseUrl}/properties/${propertyId}`;
        console.log(`Calling API with URL: ${url}`);

        apiResponse = await axios.get(url).then((response: any) => {
            console.log(`API response: ${JSON.stringify(response.data)}`);
            return response.data;
        }).catch((error: any) => {
            console.error(`Call to API failed, error: ${error}`);
            return "Call to the API failed.";
        });
    } else if (apiPath == '/properties/{propertyId}/availability') {
        console.log('Processing /properties/{propertyId}/availability endpoint');
        const propertyId = event.parameters[0]?.value || undefined;
        const endDate = event.parameters[1]?.value || undefined;
        const startDate = event.parameters[2]?.value || undefined;
        console.log(`Parameters: propertyId=${propertyId}, endDate=${endDate}, startDate=${startDate}`);
        const url = `${baseUrl}/properties/${propertyId}/availability`;
        console.log(`Calling API with URL: ${url}`);

        apiResponse = await axios.get(url, {
            params: {
                ...(propertyId && { propertyId: Number.isInteger(propertyId) ? propertyId : parseInt(propertyId) }),
                ...(endDate && { endDate: endDate }),
                ...(startDate && { startDate: startDate }),
            }
        }).then((response: any) => {
            console.log(`API response: ${JSON.stringify(response.data)}`);
            return response.data;
        }).catch((error: any) => {
            console.error(`Call to API failed, error: ${error}`);
            return "Call to the API failed.";
        });
    } else if (apiPath == '/properties/search') {
        console.log('Processing /properties/search endpoint');
        const properties = event?.requestBody?.content["application/json"]?.properties || undefined;
        if (properties) {
            const city = properties[0]?.value || undefined;
            const guests = properties[1]?.value || undefined;
            const country = properties[2]?.value || undefined;
            const bedrooms = properties[3]?.value || undefined;
            console.log(`Parameters: city=${city}, guests=${guests}, country=${country}, bedrooms=${bedrooms}`);
            const url = `${baseUrl}/properties/search`;
            console.log(`Calling API with URL: ${url}`);

            apiResponse = await axios.post(url, {
                ...(city && { city: city }),
                ...(country && { country: country }),
                ...(bedrooms && { bedrooms: Number.isInteger(bedrooms) ? bedrooms : parseInt(bedrooms) }),
                ...(guests && { guests: Number.isInteger(guests) ? guests : parseInt(guests) }),
            }).then((response: any) => {
                console.log(`API response: ${JSON.stringify(response.data)}`);
                return response.data;
            }).catch((error: any) => {
                console.error(`Call to API failed, error: ${error}`);
                return "Call to the API failed.";
            });
        } else {
            console.warn("Additional parameters are required for this call.");
            return "Additional parameters are required for this call.";
        }
    } else if (apiPath == '/bookings') {
        console.log('Processing /bookings endpoint');
        const properties = event.requestBody.content["application/json"].properties;
        const customerName = properties[0]?.value || undefined;
        const propertyId = properties[1]?.value || undefined;
        let contactDetails = properties[2]?.value || undefined;
        const endDate = properties[3]?.value || undefined;
        const startDate = properties[4]?.value || undefined;
        let paymentInformation = properties[5]?.value || undefined;
        console.log(`Parameters: customerName=${customerName}, propertyId=${propertyId}, endDate=${endDate}, startDate=${startDate}`);

        if (paymentInformation.includes("</")) {
            console.log('Parsing paymentInformation as XML');
            paymentInformation = await new Promise((resolve, reject) => {
                parseString(`<paymentInformation>${paymentInformation}</paymentInformation>`, (err, result) => {
                    if (err) {
                        console.error('Failed to parse paymentInformation as XML:', err);
                        reject(err);
                    } else {
                        resolve(result["paymentInformation"]);
                    }
                });
            });
        } else {
            paymentInformation = JSON.parse(paymentInformation);
        }

        if (contactDetails.includes("</")) {
            console.log('Parsing contactDetails as XML');
            contactDetails = await new Promise((resolve, reject) => {
                parseString(`<contactDetails>${contactDetails}</contactDetails>`, (err, result) => {
                    if (err) {
                        console.error('Failed to parse contactDetails as XML:', err);
                        reject(err);
                    } else {
                        resolve(result["contactDetails"]);
                    }
                });
            });
        } else {
            contactDetails = JSON.parse(contactDetails);
        }

        const url = `${baseUrl}/bookings`;
        console.log(`Calling API with URL: ${url}`);

        apiResponse = await axios.post(url, {
            ...(customerName && { customerName: customerName }),
            ...(propertyId && { propertyId: Number.isInteger(propertyId) ? propertyId : parseInt(propertyId) }),
            ...(contactDetails && { contactDetails: contactDetails }),
            ...(endDate && { endDate: endDate }),
            ...(startDate && { startDate: startDate }),
            ...(paymentInformation && { paymentInformation: paymentInformation }),
        }).then((response: any) => {
            console.log(`API response: ${JSON.stringify(response.data)}`);
            return response.data;
        }).catch((error: any) => {
            console.error(`Call to API failed, error: ${error}`);
            return "Call to the API failed.";
        });
    } else if (apiPath === '/booking') {
        console.log('Processing /booking endpoint');
        const bookingId = event.parameters[0]?.value;
        console.log(`Parameters: bookingId=${bookingId}`);
        const url = `${baseUrl}/booking/${bookingId}`;
        console.log(`Calling API with URL: ${url}`);

        apiResponse = await axios.delete(url).then((response: any) => {
            console.log(`API response: ${JSON.stringify(response.data)}`);
            return response.data;
        }).catch((error: any) => {
            console.error(`Call to API failed, error: ${error}`);
            return "Call to the API failed.";
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

    console.log('RESULT: \n' + JSON.stringify(result, null, 2));
    return result;
};
