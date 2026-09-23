using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using UMS.Api.Data;
using UMS.Api.Hubs;

namespace UMS.Api.Services.Enrollments;

public sealed class EnrollmentOutboxWorker(IServiceScopeFactory scopeFactory, IHubContext<EnrollmentHub> hub, ILogger<EnrollmentOutboxWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(1));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = scopeFactory.CreateScope(); 
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var messages = await db.OutboxMessages.Where(item => item.ProcessedAt == null).OrderBy(item => item.CreatedAt).Take(50).ToListAsync(stoppingToken);
                foreach (var message in messages)
                {
                    await hub.Clients.Group($"offering:{message.CourseOfferingId}").SendAsync("EnrollmentUpdated", new { offeringId = message.CourseOfferingId, revision = message.Revision }, stoppingToken);
                    message.ProcessedAt = DateTime.UtcNow;
                    message.Attempts++;
                }
                if (messages.Count > 0) await db.SaveChangesAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { }
            catch (Exception exception) { logger.LogError(exception, "Enrollment outbox delivery failed"); }
        }
    }
}
