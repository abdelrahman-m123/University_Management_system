namespace UMS.Api.Services.Common;

public class ServiceResult<T>
{
    public ResultStatus Status { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }

    public bool IsSuccess => Status == ResultStatus.Success;

    public static ServiceResult<T> Success(T data, string message)
    {
        return new ServiceResult<T>
        {
            Status = ResultStatus.Success,
            Message = message,
            Data = data
        };
    }

    public static ServiceResult<T> Failure(ResultStatus status, string message)
    {
        return new ServiceResult<T>
        {
            Status = status,
            Message = message
        };
    }
}
