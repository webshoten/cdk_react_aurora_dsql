export default {
    "scalars": [
        1,
        4,
        10
    ],
    "types": {
        "CreateUserPayload": {
            "username": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "String": {},
        "CurrentUser": {
            "groups": [
                1
            ],
            "institutionCode": [
                1
            ],
            "userId": [
                1
            ],
            "username": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Image": {
            "contentType": [
                1
            ],
            "downloadUrl": [
                1
            ],
            "fileName": [
                1
            ],
            "imageId": [
                1
            ],
            "imagePath": [
                1
            ],
            "sizeBytes": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "IotState": {
            "entityType": [
                1
            ],
            "event": [
                1
            ],
            "medicalInstitutionId": [
                1
            ],
            "patientStateJson": [
                1
            ],
            "roomId": [
                1
            ],
            "roomStateJson": [
                1
            ],
            "sessionUid": [
                1
            ],
            "topic": [
                1
            ],
            "updatedAt": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MedicalStaff": {
            "institutionCode": [
                1
            ],
            "name": [
                1
            ],
            "profession": [
                1
            ],
            "staffCode": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Mutation": {
            "addRandomMedicalStaff": [
                16,
                {
                    "institutionCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "clearMedicalStaffsByInstitution": [
                16,
                {
                    "institutionCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createImageUploadUrl": [
                8,
                {
                    "contentType": [
                        1,
                        "String!"
                    ],
                    "fileName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createUser": [
                0,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "password": [
                        1,
                        "String!"
                    ],
                    "username": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publishOnStartRoom": [
                9,
                {
                    "roomId": [
                        1,
                        "String!"
                    ],
                    "startedAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "registerImage": [
                12,
                {
                    "contentType": [
                        1,
                        "String!"
                    ],
                    "fileName": [
                        1,
                        "String!"
                    ],
                    "imagePath": [
                        1,
                        "String!"
                    ],
                    "sizeBytes": [
                        4,
                        "Int!"
                    ]
                }
            ],
            "resetUserPassword": [
                13,
                {
                    "username": [
                        1,
                        "String!"
                    ]
                }
            ],
            "seedMedicalStaffs": [
                16
            ],
            "syncCurrentUserMfaPreference": [
                15,
                {
                    "mfaPreference": [
                        1,
                        "String!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "PresignedUploadPayload": {
            "imagePath": [
                1
            ],
            "uploadUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PublishOnStartRoomPayload": {
            "published": [
                10
            ],
            "topic": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "Query": {
            "currentUser": [
                2
            ],
            "images": [
                3
            ],
            "iotStatesByRoom": [
                5,
                {
                    "roomId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "medicalStaffsByInstitution": [
                6,
                {
                    "institutionCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "seedItems": [
                14
            ],
            "users": [
                17
            ],
            "__typename": [
                1
            ]
        },
        "RegisterImagePayload": {
            "appliedCount": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ResetUserPasswordPayload": {
            "temporaryPassword": [
                1
            ],
            "username": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SeedItem": {
            "code": [
                1
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SyncCurrentUserMfaPreferencePayload": {
            "synced": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "UpsertMedicalStaffsPayload": {
            "appliedCount": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "User": {
            "createdAt": [
                1
            ],
            "email": [
                1
            ],
            "medicalInstitutionId": [
                1
            ],
            "mfaPreference": [
                1
            ],
            "uid": [
                1
            ],
            "userType": [
                1
            ],
            "username": [
                1
            ],
            "__typename": [
                1
            ]
        }
    }
}