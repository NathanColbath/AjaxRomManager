using Microsoft.AspNetCore.SignalR;
using AjaxRomManager.Api.Models;

namespace AJAX_API.Hubs
{
    /// <summary>
    /// SignalR hub for real-time scan progress updates
    /// </summary>
    public class ScanningHub : Hub
    {
        public async Task JoinScanGroup(int scanJobId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Scan_{scanJobId}");
        }

        public async Task LeaveScanGroup(int scanJobId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Scan_{scanJobId}");
        }

        public async Task JoinAllScansGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "AllScans");
        }

        public async Task LeaveAllScansGroup()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "AllScans");
        }
    }
}
