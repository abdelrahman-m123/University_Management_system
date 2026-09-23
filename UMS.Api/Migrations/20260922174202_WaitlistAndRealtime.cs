using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UMS.Api.Migrations
{
    /// <inheritdoc />
    public partial class WaitlistAndRealtime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "WaitlistSequence",
                table: "CourseEnrollments",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "WaitlistedAt",
                table: "CourseEnrollments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourseEnrollments_CourseOfferingId_Status_WaitlistSequence",
                table: "CourseEnrollments",
                columns: new[] { "CourseOfferingId", "Status", "WaitlistSequence" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CourseEnrollments_CourseOfferingId_Status_WaitlistSequence",
                table: "CourseEnrollments");

            migrationBuilder.DropColumn(
                name: "WaitlistSequence",
                table: "CourseEnrollments");

            migrationBuilder.DropColumn(
                name: "WaitlistedAt",
                table: "CourseEnrollments");
        }
    }
}
