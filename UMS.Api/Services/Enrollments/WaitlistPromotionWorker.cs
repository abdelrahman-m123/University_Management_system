using Microsoft.Extensions.Hosting;

namespace UMS.Api.Services.Enrollments;

public sealed class WaitlistPromotionWorker(IServiceScopeFactory scopeFactory, ILogger<WaitlistPromotionWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(15));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<IEnrollmentService>();
                var promoted = await service.PromoteWaitlistsAsync(stoppingToken);
                if (promoted > 0) logger.LogInformation("Promoted {Count} waitlisted enrollments", promoted);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { }
            catch (Exception exception) { logger.LogError(exception, "Waitlist promotion failed"); }
        }
    }
}
