export async function handler(event: any) {
  const response = event.Records[0].cf.response;
  const request = event.Records[0].cf.request;

  console.log("RESPONSE: ", JSON.stringify(response));
  console.log("REQUEST: ", JSON.stringify(request));

  /**
   * This function updates the HTTP status code in the response to 302, to redirect to another
   * path (cache behavior) that has a different origin configured. Note the following:
   * 1. The function is triggered in an origin response
   * 2. The response status from the origin server is an error status code (4xx or 5xx)
   */
  const responseStatus = parseInt(response.status);
  if (responseStatus >= 400 && responseStatus <= 599) {
    const redirect_path = `/404?file=${request.uri}`;

    response.status = 302;
    response.statusDescription = "Found";

    /* Drop the body, as it is not required for redirects */
    response.body = "";
    response.headers["location"] = [{ key: "Location", value: redirect_path }];
  }

  return response;
}
