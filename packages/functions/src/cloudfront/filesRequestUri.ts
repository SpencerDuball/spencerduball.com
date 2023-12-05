export async function handler(event: any) {
  const request = event.Records[0].cf.request;
  console.log("REQUEST: ", JSON.stringify(request));

  // This function removes the 'files/' prefix from the path. If this is not removed then files in the S3 bucket
  // would need to be in the 'files/' directory. By removing this from the request URI, all requests to the S3
  // bucket via cloudfront will start their pattern match fromthe top of the bucket.
  request.uri = request.uri.replace(/^\/files/, "");
  console.log("UPDATED URI: ", request.uri);

  return request;
}
