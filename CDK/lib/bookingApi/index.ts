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
            console.log(response);
            return response;
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
