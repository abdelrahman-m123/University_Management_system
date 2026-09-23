using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace UMS.Api.Hubs;

[Authorize]
public sealed class EnrollmentHub : Hub
{
    public Task SubscribeOffering(int offeringId) => Groups.AddToGroupAsync(Context.ConnectionId, $"offering:{offeringId}");
    public Task UnsubscribeOffering(int offeringId) => Groups.RemoveFromGroupAsync(Context.ConnectionId, $"offering:{offeringId}");
}
