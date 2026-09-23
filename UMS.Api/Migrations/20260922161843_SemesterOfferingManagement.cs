using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UMS.Api.Migrations
{
    /// <inheritdoc />
    public partial class SemesterOfferingManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM [QuizGrades]; DELETE FROM [Comments]; DELETE FROM [QuestionnaireQuestions]; DELETE FROM [Quizzes]; DELETE FROM [Announcements]; DELETE FROM [CourseContents]; DELETE FROM [CourseEnrollments]; DELETE FROM [StaffCourses]; DELETE FROM [Questionnaires];");

            migrationBuilder.DropForeignKey(
                name: "FK_Announcements_Courses_CourseId",
                table: "Announcements");

            migrationBuilder.DropForeignKey(
                name: "FK_CourseContents_Courses_CourseId",
                table: "CourseContents");

            migrationBuilder.DropForeignKey(
                name: "FK_CourseEnrollments_Courses_CourseId",
                table: "CourseEnrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_Questionnaires_Courses_CourseId",
                table: "Questionnaires");

            migrationBuilder.DropForeignKey(
                name: "FK_Quizzes_Courses_CourseId",
                table: "Quizzes");

            migrationBuilder.DropForeignKey(
                name: "FK_StaffCourses_Courses_CourseId",
                table: "StaffCourses");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "StaffCourses",
                newName: "CourseOfferingId");

            migrationBuilder.RenameIndex(
                name: "IX_StaffCourses_CourseId",
                table: "StaffCourses",
                newName: "IX_StaffCourses_CourseOfferingId");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "Quizzes",
                newName: "CourseOfferingId");

            migrationBuilder.RenameIndex(
                name: "IX_Quizzes_CourseId",
                table: "Quizzes",
                newName: "IX_Quizzes_CourseOfferingId");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "Questionnaires",
                newName: "CourseOfferingId");

            migrationBuilder.RenameIndex(
                name: "IX_Questionnaires_CourseId",
                table: "Questionnaires",
                newName: "IX_Questionnaires_CourseOfferingId");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "CourseEnrollments",
                newName: "CourseOfferingId");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "CourseContents",
                newName: "CourseOfferingId");

            migrationBuilder.RenameIndex(
                name: "IX_CourseContents_CourseId",
                table: "CourseContents",
                newName: "IX_CourseContents_CourseOfferingId");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "Announcements",
                newName: "CourseOfferingId");

            migrationBuilder.RenameIndex(
                name: "IX_Announcements_CourseId",
                table: "Announcements",
                newName: "IX_Announcements_CourseOfferingId");

            migrationBuilder.CreateTable(
                name: "AcademicYears",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    StartsAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndsAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicYears", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Semesters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AcademicYearId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartsAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndsAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RegistrationOpensAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    RegistrationClosesAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AddDropOpensAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AddDropClosesAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Semesters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Semesters_AcademicYears_AcademicYearId",
                        column: x => x.AcademicYearId,
                        principalTable: "AcademicYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CourseOfferings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<int>(type: "int", nullable: false),
                    SemesterId = table.Column<int>(type: "int", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseOfferings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseOfferings_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CourseOfferings_Semesters_SemesterId",
                        column: x => x.SemesterId,
                        principalTable: "Semesters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AcademicYears_Name",
                table: "AcademicYears",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourseOfferings_CourseId_SemesterId",
                table: "CourseOfferings",
                columns: new[] { "CourseId", "SemesterId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourseOfferings_SemesterId",
                table: "CourseOfferings",
                column: "SemesterId");

            migrationBuilder.CreateIndex(
                name: "IX_Semesters_AcademicYearId",
                table: "Semesters",
                column: "AcademicYearId");

            migrationBuilder.AddForeignKey(
                name: "FK_Announcements_CourseOfferings_CourseOfferingId",
                table: "Announcements",
                column: "CourseOfferingId",
                principalTable: "CourseOfferings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CourseContents_CourseOfferings_CourseOfferingId",
                table: "CourseContents",
                column: "CourseOfferingId",
                principalTable: "CourseOfferings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CourseEnrollments_CourseOfferings_CourseOfferingId",
                table: "CourseEnrollments",
                column: "CourseOfferingId",
                principalTable: "CourseOfferings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Questionnaires_CourseOfferings_CourseOfferingId",
                table: "Questionnaires",
                column: "CourseOfferingId",
                principalTable: "CourseOfferings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Quizzes_CourseOfferings_CourseOfferingId",
                table: "Quizzes",
                column: "CourseOfferingId",
                principalTable: "CourseOfferings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StaffCourses_CourseOfferings_CourseOfferingId",
                table: "StaffCourses",
                column: "CourseOfferingId",
                principalTable: "CourseOfferings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Announcements_CourseOfferings_CourseOfferingId",
                table: "Announcements");

            migrationBuilder.DropForeignKey(
                name: "FK_CourseContents_CourseOfferings_CourseOfferingId",
                table: "CourseContents");

            migrationBuilder.DropForeignKey(
                name: "FK_CourseEnrollments_CourseOfferings_CourseOfferingId",
                table: "CourseEnrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_Questionnaires_CourseOfferings_CourseOfferingId",
                table: "Questionnaires");

            migrationBuilder.DropForeignKey(
                name: "FK_Quizzes_CourseOfferings_CourseOfferingId",
                table: "Quizzes");

            migrationBuilder.DropForeignKey(
                name: "FK_StaffCourses_CourseOfferings_CourseOfferingId",
                table: "StaffCourses");

            migrationBuilder.DropTable(
                name: "CourseOfferings");

            migrationBuilder.DropTable(
                name: "Semesters");

            migrationBuilder.DropTable(
                name: "AcademicYears");

            migrationBuilder.RenameColumn(
                name: "CourseOfferingId",
                table: "StaffCourses",
                newName: "CourseId");

            migrationBuilder.RenameIndex(
                name: "IX_StaffCourses_CourseOfferingId",
                table: "StaffCourses",
                newName: "IX_StaffCourses_CourseId");

            migrationBuilder.RenameColumn(
                name: "CourseOfferingId",
                table: "Quizzes",
                newName: "CourseId");

            migrationBuilder.RenameIndex(
                name: "IX_Quizzes_CourseOfferingId",
                table: "Quizzes",
                newName: "IX_Quizzes_CourseId");

            migrationBuilder.RenameColumn(
                name: "CourseOfferingId",
                table: "Questionnaires",
                newName: "CourseId");

            migrationBuilder.RenameIndex(
                name: "IX_Questionnaires_CourseOfferingId",
                table: "Questionnaires",
                newName: "IX_Questionnaires_CourseId");

            migrationBuilder.RenameColumn(
                name: "CourseOfferingId",
                table: "CourseEnrollments",
                newName: "CourseId");

            migrationBuilder.RenameColumn(
                name: "CourseOfferingId",
                table: "CourseContents",
                newName: "CourseId");

            migrationBuilder.RenameIndex(
                name: "IX_CourseContents_CourseOfferingId",
                table: "CourseContents",
                newName: "IX_CourseContents_CourseId");

            migrationBuilder.RenameColumn(
                name: "CourseOfferingId",
                table: "Announcements",
                newName: "CourseId");

            migrationBuilder.RenameIndex(
                name: "IX_Announcements_CourseOfferingId",
                table: "Announcements",
                newName: "IX_Announcements_CourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Announcements_Courses_CourseId",
                table: "Announcements",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CourseContents_Courses_CourseId",
                table: "CourseContents",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CourseEnrollments_Courses_CourseId",
                table: "CourseEnrollments",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Questionnaires_Courses_CourseId",
                table: "Questionnaires",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Quizzes_Courses_CourseId",
                table: "Quizzes",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StaffCourses_Courses_CourseId",
                table: "StaffCourses",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
