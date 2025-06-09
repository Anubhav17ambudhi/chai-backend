class ApiResponse{
  constructor(statusCode,data,message = "Success"){
    this.statusCode = statusCode
    this.data = data
    this.message = message
    this.success = statusCode < 400
    //sever has statusCode
    //for informational responses we have (100 to 400)
    //for successful responses (200 to 299)
    //Redirectin messages(300 to 399)
    //client error responses(400 to 499)
    //Server error responses(500 to 599)
  }
}

export { ApiResponse }