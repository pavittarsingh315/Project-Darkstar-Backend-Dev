function ValidateEmail(email: String): boolean {
   const re =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
   return re.test(String(email).toLowerCase()) ? true : false;
}

export default ValidateEmail;
