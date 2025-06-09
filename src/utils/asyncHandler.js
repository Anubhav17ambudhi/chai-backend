const asyncHandler = (requestHandler) => {
  return (req,res,next) => {
    Promise.resolve(requestHandler(req,res,next)).
    catch((err) => next(err))
  }//here should we return this ?? DOUBT
}

export {asyncHandler}

// const asyncHandler = () => {}
// const asyncHandler = (func) => {() => {}} 
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}
 


// const asyncHandler = (fn) => async(req,res,next) => {
//   try {
//     await fn(req,res,next)
//   } catch (error) {
//     res.status(err.code||500).json({
//       success: false,
//       message: err.message
//     })
//   }
// }