using SmartOffice.AssetService.Models;

namespace SmartOffice.AssetService.Data
{
    public static class LockerDemoSeeder
    {
        private const string DemoUserPrefix =
            "demo-locker-user-";

        /*
            Demo distribution PER FLOOR:

            001 - 035 -> Assigned
            036 - 038 -> Pending Admin Approval
            039 - 040 -> Ready for Key Pickup
            041 - 048 -> Available
            049 - 050 -> Maintenance

            Across both floors:

            70 Assigned
            6 Pending
            4 Key Ready
            16 Available
            4 Maintenance
        */

        public static async Task
            EnsureDemoDataAsync(
                MongoDbService mongoDbService
            )
        {
            var existingActiveRequests =
                await mongoDbService
                    .GetActiveLockerRequestsAsync();

            /*
                If demo requests already exist,
                do not seed them again.

                This makes the demo seed idempotent
                during normal application restarts.
            */

            var demoAlreadyExists =
                existingActiveRequests.Any(
                    request =>
                        request
                            .RequestedByUserId
                            .StartsWith(
                                DemoUserPrefix,
                                StringComparison.OrdinalIgnoreCase
                            )
                );

            if (demoAlreadyExists)
            {
                return;
            }

            var lockers =
                await mongoDbService
                    .GetLockersAsync();

            var orderedLockers =
                lockers
                    .OrderBy(
                        locker =>
                            locker.Location
                    )
                    .ThenBy(
                        locker =>
                            locker.Name
                    )
                    .ToList();

            var demoUserNumber =
                0;

            foreach (
                var locker
                in orderedLockers
            )
            {
                if (
                    string.IsNullOrWhiteSpace(
                        locker.Id
                    )
                )
                {
                    continue;
                }

                var lockerNumber =
                    GetLockerNumber(
                        locker.Name
                    );

                if (
                    lockerNumber ==
                    null
                )
                {
                    continue;
                }

                var existingRequest =
                    await mongoDbService
                        .GetActiveLockerRequestForLockerAsync(
                            locker.Id
                        );

                /*
                    Never overwrite real activity.
                */

                if (
                    existingRequest !=
                    null
                )
                {
                    continue;
                }

                // =================================
                // MAINTENANCE
                // 049 - 050
                // =================================

                if (
                    lockerNumber >=
                    49
                )
                {
                    await mongoDbService
                        .UpdateLockerOperationalStatusAsync(
                            locker.Id,
                            "Maintenance"
                        );

                    continue;
                }

                /*
                    041 - 048 remain Available.
                */

                if (
                    lockerNumber >=
                    41
                )
                {
                    continue;
                }

                // =================================
                // DEMO REQUEST
                // =================================

                demoUserNumber++;

                var employeeName =
                    GetDemoEmployeeName(
                        demoUserNumber
                    );

                var createdRequest =
                    await mongoDbService
                        .CreateLockerRequestAsync(
                            new LockerRequest
                            {
                                LockerId =
                                    locker.Id,

                                LockerName =
                                    locker.Name,

                                Floor =
                                    locker.Location,

                                RequestedByUserId =
                                    $"{DemoUserPrefix}{demoUserNumber:D3}",

                                RequestedBy =
                                    employeeName,

                                Status =
                                    "Pending",

                                IsActive =
                                    true
                            }
                        );

                if (
                    string.IsNullOrWhiteSpace(
                        createdRequest.Id
                    )
                )
                {
                    continue;
                }

                // =================================
                // ASSIGNED
                // 001 - 035
                // =================================

                if (
                    lockerNumber <=
                    35
                )
                {
                    await mongoDbService
                        .ApproveLockerRequestAsync(
                            createdRequest.Id,
                            "demo-admin-user",
                            "Admin Team"
                        );

                    await mongoDbService
                        .MarkLockerKeyCollectedAsync(
                            createdRequest.Id
                        );

                    continue;
                }

                // =================================
                // PENDING
                // 036 - 038
                // =================================

                if (
                    lockerNumber <=
                    38
                )
                {
                    continue;
                }

                // =================================
                // APPROVED / KEY READY
                // 039 - 040
                // =================================

                await mongoDbService
                    .ApproveLockerRequestAsync(
                        createdRequest.Id,
                        "demo-admin-user",
                        "Admin Team"
                    );
            }
        }

        private static int?
            GetLockerNumber(
                string lockerName
            )
        {
            var parts =
                lockerName.Split(
                    '-',
                    StringSplitOptions.RemoveEmptyEntries
                );

            if (
                parts.Length != 2
            )
            {
                return null;
            }

            if (
                !int.TryParse(
                    parts[1],
                    out var number
                )
            )
            {
                return null;
            }

            return number;
        }

        private static string
            GetDemoEmployeeName(
                int index
            )
        {
            var firstNames =
                new[]
                {
                    "Maya",
                    "Daniel",
                    "Noa",
                    "Amit",
                    "Dana",
                    "Omer",
                    "Yael",
                    "Tom",
                    "Shira",
                    "Ron"
                };

            var lastNames =
                new[]
                {
                    "Cohen",
                    "Levi",
                    "Mizrahi",
                    "Peretz",
                    "Barak",
                    "Shalev",
                    "Rosen",
                    "Adler"
                };

            var zeroBased =
                Math.Max(
                    index - 1,
                    0
                );

            var firstName =
                firstNames[
                    zeroBased %
                    firstNames.Length
                ];

            var lastName =
                lastNames[
                    (
                        zeroBased /
                        firstNames.Length
                    ) %
                    lastNames.Length
                ];

            return
                $"{firstName} {lastName}";
        }
    }
}