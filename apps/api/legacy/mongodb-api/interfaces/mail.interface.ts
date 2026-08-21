export interface IMailOptions{
    from : string,
    to? : string,
    subject ? : string,
    html ? : string,
    bodyParts ? : string | any,
}