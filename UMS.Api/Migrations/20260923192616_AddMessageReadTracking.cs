using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UMS.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMessageReadTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ReadAt",
                table: "Messages",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ChatId_ReadAt",
                table: "Messages",
                columns: new[] { "ChatId", "ReadAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Messages_ChatId_ReadAt",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "ReadAt",
                table: "Messages");
        }
    }
}
