module.exports = (target, targetName) => (
{
  Object: {
    ID: '83f6394a-e5cd-4b30-9112-ce37aa42b5b5',
    Components: {
      ID: 'abab8384-f9d1-4d7a-9f29-d86557e49763',
      Data: [
        {
          Type: 'FrooxEngine.InventoryItem',
          Data: {
            ID: '73ec0876-bdbe-4f87-96e4-7efcdc57e0c0',
            'persistent-ID': '9a069b89-f2c6-466c-b074-c87273ca4811',
            UpdateOrder: { ID: 'd6bd80db-c25f-4a46-acf7-6c28c84e6382', Data: 0 },
            Enabled: { ID: 'a01cd9ab-e54f-43a3-80d3-b246f5033198', Data: true },
            RelativeToUserRoot: { ID: '32389ee1-6dac-4e0e-916f-84c4c4ea64a7', Data: true },
            SavedRotation: {
              ID: 'aaf85600-2857-4cb9-ae71-85250fc5985a',
              Data: [ 0, 0, 0, 0 ]
            },
            SavedScale: {
              ID: 'c9de0c21-76a6-40e9-9858-18ef158c3fd8',
              Data: [ 0.0005, 0.0005, 0.0005 ]
            }
          }
        }
      ]
    },
    Name: { ID: '0c79a355-cd62-4750-8fc6-e2acd050a097', Data: 'Holder' },
    Tag: { ID: 'a6743c9b-ab25-4dc6-b029-e611e851bfe0', Data: null },
    Active: { ID: 'f32131a5-4cee-4b6a-bf61-14bfd69681eb', Data: true },
    'Persistent-ID': '53f76250-7901-4806-9472-9a26a6f4b950',
    Position: {
      ID: '8c18089a-51ee-4b20-af5c-655152090b80',
      Data: [ 0, 0, 0 ]
    },
    Rotation: {
      ID: '5a831e68-868f-4e27-9c09-2a5dcd369fd1',
      Data: [ 0, 0, 0, 0 ]
    },
    Scale: {
      ID: '1959aafb-b353-4ce6-87cc-414c1d5fcc1a',
      Data: [ 1, 1, 1 ]
    },
    OrderOffset: { ID: '83b92e36-c20a-405a-8e01-3bd335b0d6ce', Data: 0 },
    ParentReference: 'd21cc373-ef75-4fc9-bc94-9dfbd7be8d39',
    Children: [
      {
        ID: 'f6ea8322-c5e4-47bb-8ba4-636ac83003b0',
        Components: {
          ID: '1584d372-6126-4372-8edf-d9134f88c7cc',
          Data: [
            {
              Type: 'FrooxEngine.InventoryLink',
              Data: {
                ID: 'd9b31145-b0f6-45f3-85e2-912213485524',
                'persistent-ID': '365d08ed-130b-4c4c-9247-69f3f29896f8',
                UpdateOrder: {
                  ID: 'e6c58518-3e5a-4245-8f6c-ead831160235',
                  Data: 0
                },
                Enabled: {
                  ID: '33a417c3-b152-4c13-be73-0bd653ad4b56',
                  Data: true
                },
                TargetName: {
                  ID: 'f4739efb-b003-4966-9259-7ce5256d9d4f',
                  Data: targetName
                },
                Target: {
                  ID: 'f8f9874f-b2fd-4215-8cd7-cb83fd2961bf',
                  Data: '@' + target
                }
              }
            },
            {
              Type: 'FrooxEngine.Grabbable',
              Data: {
                ID: '41717d3a-6ea9-4aab-b9d9-a316a7b122fe',
                'persistent-ID': 'a916eae7-e7fc-4774-a3a9-5a7d36e268e4',
                UpdateOrder: {
                  ID: 'b852e2b9-7dff-47b9-ab44-9dae841c1bf1',
                  Data: 0
                },
                Enabled: {
                  ID: '495f8a8c-6c52-4166-8bef-013b36608412',
                  Data: true
                },
                ReparentOnRelease: {
                  ID: '1df25472-a86f-4cec-a80a-04a7f35eb310',
                  Data: true
                },
                PreserveUserSpace: {
                  ID: '95314130-0827-4940-b9a2-e8d0ada77562',
                  Data: true
                },
                DestroyOnRelease: {
                  ID: '360117ab-680c-4055-bde6-5fa2f2fc181f',
                  Data: false
                },
                GrabPriority: {
                  ID: '9dc82223-80ae-4d31-8505-31389f380bd1',
                  Data: 0
                },
                GrabPriorityWhenGrabbed: {
                  ID: 'f4cca991-aee7-479d-93ea-c327c77024b5',
                  Data: null
                },
                CustomCanGrabCheck: {
                  ID: 'e45dde91-f1e2-44b1-8394-0a3dd05406d7',
                  Data: { Target: null }
                },
                EditModeOnly: {
                  ID: 'a904c90e-6327-4a0a-8a1b-cd7ab4235955',
                  Data: false
                },
                AllowSteal: {
                  ID: '2f6cdc77-fd76-4d63-ac2a-751994c4aaa6',
                  Data: false
                },
                DropOnDisable: {
                  ID: 'df27ebe8-4bb2-43d4-a844-fdfeadb60660',
                  Data: true
                },
                ActiveUserFilter: {
                  ID: '76508816-3099-4c76-a3e4-d5cd840c750f',
                  Data: 'Disabled'
                },
                OnlyUsers: {
                  ID: '8301f98c-ef3a-4fe4-88c4-f0e0f091cead',
                  Data: []
                },
                Scalable: {
                  ID: 'c609cc2a-9f40-40ba-adcc-ca476d637ff9',
                  Data: true
                },
                Receivable: {
                  ID: 'df78f684-14d0-489b-be5e-52ff4e6127b1',
                  Data: true
                },
                AllowOnlyPhysicalGrab: {
                  ID: '3c165627-1cd0-410b-86bc-36e09677e971',
                  Data: false
                },
                _grabber: {
                  ID: '07feb9ab-f3d1-4309-ad85-2e6c1d9680a7',
                  Data: null
                },
                _lastParent: {
                  ID: '4ad90f67-a8e6-4428-933f-e9d77507d70c',
                  Data: '0fae5c94-2d46-4120-a754-ab0db877acc7'
                },
                _lastParentIsUserSpace: {
                  ID: 'b8152468-90a2-4d37-a124-b246fdf26be8',
                  Data: false
                },
                '__legacyActiveUserRootOnly-ID': '3fdf9da7-28ff-4b33-928b-263f488c8784'
              }
            },
            {
              Type: 'FrooxEngine.UIX.Canvas',
              Data: {
                ID: '141c4d9a-faaf-4676-850b-1fdeaa95615e',
                'persistent-ID': 'f60286d0-0744-4788-b725-ca7f1813d90a',
                UpdateOrder: {
                  ID: 'd3ce096b-f058-4a1f-b486-a0ad92abedbd',
                  Data: 100000
                },
                Enabled: {
                  ID: '22f7f9bb-522c-43f1-9748-dc80caffa20a',
                  Data: true
                },
                Size: {
                  ID: '30133a5b-ed0a-4ac0-b3dd-97e3d551795b',
                  Data: [ 200, 200 ]
                },
                EditModeOnly: {
                  ID: 'd1b40e3f-38c1-44bf-823c-7360b2ecc05c',
                  Data: false
                },
                AcceptRemoteTouch: {
                  ID: 'd14b7555-41ca-41ca-a2a5-0387b8823517',
                  Data: true
                },
                AcceptPhysicalTouch: {
                  ID: 'ca3c0c41-cc63-4d6c-9309-1196cbbb19d2',
                  Data: true
                },
                AcceptExistingTouch: {
                  ID: 'efefc4a9-3e3f-4f7b-b0d6-4195200924bf',
                  Data: false
                },
                HighPriorityIntegration: {
                  ID: 'fcd3d213-f8ac-465a-a909-d6b6948a1f31',
                  Data: false
                },
                IgnoreTouchesFromBehind: {
                  ID: '842a0348-8831-4c7b-a3ea-70bdb5273f24',
                  Data: true
                },
                BlockAllInteractions: {
                  ID: '14794133-010b-44d3-9327-9875b7e6b217',
                  Data: false
                },
                LaserPassThrough: {
                  ID: 'db5d2454-ba13-414d-969f-3f6a8702583e',
                  Data: false
                },
                PixelScale: {
                  ID: '5ffb7424-7445-48c9-9435-8c2030ddca80',
                  Data: 1
                },
                UnitScale: {
                  ID: '16c13b47-1894-4124-86d4-571af7140762',
                  Data: 1
                },
                _rootRect: {
                  ID: 'ba098c28-f46d-4d39-add8-a343cdf26c30',
                  Data: '263350bc-66d3-4a3e-b594-0f90aead05c4'
                },
                Collider: {
                  ID: 'dcc01025-b78e-4a77-8258-9e533c310e12',
                  Data: '6a05d2f4-077d-4bf7-9c28-c7c2f3edbd61'
                },
                _colliderSize: {
                  ID: '7d8a7efa-7d5d-4c5c-be63-390b859a24f9',
                  Data: 'aada2067-0061-4568-bdc4-4a313afc674a'
                },
                _colliderOffset: {
                  ID: '7a9f5ac0-6f4b-499b-9479-de357bb67d62',
                  Data: '9199b09c-6c6d-4011-9913-d265b1ce2745'
                },
                StartingOffset: {
                  ID: '1e0099b9-9cf4-4451-9e26-14bb3c5aeea9',
                  Data: -32000
                },
                StartingMaskDepth: {
                  ID: 'f4fc556f-0e5f-481e-bbdc-fc026564c319',
                  Data: 0
                }
              }
            },
            {
              Type: 'FrooxEngine.UIX.RectTransform',
              Data: {
                ID: '263350bc-66d3-4a3e-b594-0f90aead05c4',
                'persistent-ID': '593d3cb5-011f-4ada-8b26-3e6578e00cd5',
                UpdateOrder: {
                  ID: 'f5ea3ace-8992-4d59-a26b-503767d2494a',
                  Data: 0
                },
                Enabled: {
                  ID: '4a383ee6-5dd5-443b-805d-b4928e96cb0b',
                  Data: true
                },
                AnchorMin: {
                  ID: '6cdff94c-0ee5-4a7a-8458-dfc27ddf1217',
                  Data: [ 0, 0 ]
                },
                AnchorMax: {
                  ID: '3b324e8d-2ce7-489c-a5aa-2bcb65b6f87b',
                  Data: [ 1, 1 ]
                },
                OffsetMin: {
                  ID: '06b39ccc-7f3d-4483-942b-f414d94390c6',
                  Data: [ 0, 0 ]
                },
                OffsetMax: {
                  ID: '26ec2386-c9cc-40ed-8cb6-73725428efbd',
                  Data: [ 0, 0 ]
                },
                Pivot: {
                  ID: 'a4fc617c-41e3-4c21-a562-4ff721121148',
                  Data: [ 0.5, 0.5 ]
                }
              }
            },
            {
              Type: 'FrooxEngine.BoxCollider',
              Data: {
                ID: '6a05d2f4-077d-4bf7-9c28-c7c2f3edbd61',
                'persistent-ID': '219b128e-8c62-4a63-9948-e4b2e6c85583',
                UpdateOrder: {
                  ID: 'e8ae9290-893a-4010-a7cd-fe95675f9db5',
                  Data: 1000000
                },
                Enabled: {
                  ID: '364a2c64-f011-4438-92d4-8079ce23bbdf',
                  Data: true
                },
                Offset: {
                  ID: '9199b09c-6c6d-4011-9913-d265b1ce2745',
                  Data: [ 0, 0, 0 ]
                },
                Type: {
                  ID: '34356600-df8d-4bea-9c1f-5dc8f059c9d2',
                  Data: 'Static'
                },
                Mass: {
                  ID: '132c38ed-012d-4d9e-b614-94bf451b75b4',
                  Data: 1
                },
                CharacterCollider: {
                  ID: '03678d69-e271-472c-8356-6a6683238d28',
                  Data: false
                },
                IgnoreRaycasts: {
                  ID: '62f399e6-b6ea-4a06-91d1-a80a24ec9b69',
                  Data: false
                },
                Size: {
                  ID: 'aada2067-0061-4568-bdc4-4a313afc674a',
                  Data: [ 200, 200, 0 ]
                }
              }
            }
          ]
        },
        Name: {
          ID: '71c95179-e36d-43eb-b69e-d7384855d07b',
          Data: 'Inventory link to ' + targetName
        },
        Tag: { ID: 'ade03bde-d912-4332-8ba5-e3dd86f2180f', Data: null },
        Active: { ID: 'c483771c-f5bb-4808-8131-04df07c900b5', Data: true },
        'Persistent-ID': '6fc10a6c-8172-4e7b-bade-accb68d0d05e',
        Position: {
          ID: '657adf5c-fca3-488a-a730-4ae7f7b7460c',
          Data: [ 0, 0, 0 ]
        },
        Rotation: {
          ID: '31af25d1-f78c-4c8f-900b-465d6e424a2d',
          Data: [ 0, 0, 0, 1 ]
        },
        Scale: {
          ID: '1d551e51-9a17-4630-aa60-4dabe271beaf',
          Data: [ 0.0005, 0.0005, 0.0005 ]
        },
        OrderOffset: { ID: '164c4249-11a7-4085-89f5-522ed8d231a2', Data: 0 },
        ParentReference: 'c78dcc90-dc71-4f38-b7bc-dc23c00a1c7f',
        Children: [
          {
            ID: '844ba330-c52e-4a04-8f79-eefb89818b1e',
            Components: {
              ID: 'b6cbc205-0544-4f24-8a2f-d0824ab1820b',
              Data: [
                {
                  Type: 'FrooxEngine.UIX.RectTransform',
                  Data: {
                    ID: 'a62d29a1-6ee6-4647-a3e5-b8cb0cc024a6',
                    'persistent-ID': '3f586337-1a53-438c-99a6-1fd26564bae5',
                    UpdateOrder: {
                      ID: '165dc4cf-f139-487e-9b1e-812f3fe44946',
                      Data: 0
                    },
                    Enabled: {
                      ID: '9c005e8a-2bf4-4b84-9c6c-0ddcc8911bc9',
                      Data: true
                    },
                    AnchorMin: {
                      ID: '057e4ca6-5036-4a2a-b120-100dc897f5f5',
                      Data: [ 0, 0 ]
                    },
                    AnchorMax: {
                      ID: '1d8ca73e-c5ab-4833-8017-81d3e6c7fb79',
                      Data: [ 1, 1 ]
                    },
                    OffsetMin: {
                      ID: '42db9475-c51b-41e7-89f2-2747c3f4ef32',
                      Data: [ 0, 0 ]
                    },
                    OffsetMax: {
                      ID: '87a1b10c-6115-41ab-95ff-633dceac77e4',
                      Data: [ 0, 0 ]
                    },
                    Pivot: {
                      ID: '7a921c8c-c19b-47d2-aba8-db384b04349c',
                      Data: [ 0.5, 0.5 ]
                    }
                  }
                },
                {
                  Type: 'FrooxEngine.UIX.Image',
                  Data: {
                    ID: '7f54295c-91ec-4b16-ae24-16c950466c67',
                    'persistent-ID': '48f9612e-a407-4731-87d3-8d38ee4a2a67',
                    UpdateOrder: {
                      ID: 'da27cfb4-17c6-486c-a3a7-b0cc0c90912a',
                      Data: 0
                    },
                    Enabled: {
                      ID: 'b66f3d82-507a-4d39-9129-7f5ec2f266a9',
                      Data: true
                    },
                    Sprite: {
                      ID: '7d67aea4-e5a1-43f2-b007-34bf642f151a',
                      Data: null
                    },
                    Material: {
                      ID: '4503143a-b36b-4ecf-8bb2-91032c9102b6',
                      Data: '6f7b46b8-0237-49f1-a372-1da86573e072'
                    },
                    Tint: {
                      ID: 'd8e7148d-26b2-4eb5-b385-6952b05b4cb9',
                      Data: [ 1, 0.75, 0.5, 0.75 ]
                    },
                    PreserveAspect: {
                      ID: '443e26e5-dcc2-4c61-b5eb-e86bb879cdf5',
                      Data: true
                    },
                    NineSliceSizing: {
                      ID: '267de63e-b73a-414d-9d14-834176e4aaa2',
                      Data: 'TextureSize'
                    },
                    InteractionTarget: {
                      ID: 'feb72f38-faa9-4f56-ab64-7aa97604ff2a',
                      Data: true
                    },
                    '__legacyZWrite-ID': 'b4451500-ddbb-402c-945d-9891a9b2c819'
                  }
                }
              ]
            },
            Name: {
              ID: '652bd13b-54ed-4961-bbd5-dbb72cd4521e',
              Data: 'Image'
            },
            Tag: {
              ID: '0629bda1-31ae-4e7d-bf92-2f3bc54d711d',
              Data: null
            },
            Active: {
              ID: '8ab985be-ea64-4f78-a909-1166539f2e31',
              Data: true
            },
            'Persistent-ID': '9218812e-6125-4065-aa87-31111c4ffa52',
            Position: {
              ID: 'c4f905f1-c7a5-4b87-9d46-41fc1c2bcea4',
              Data: [ 0, 0, 0 ]
            },
            Rotation: {
              ID: '8f00732e-df30-4c75-bfe4-ad0975ec3a91',
              Data: [ 0, 0, 0, 1 ]
            },
            Scale: {
              ID: '6f2e6ec2-a63e-405e-8790-ae3068a017c2',
              Data: [ 1, 1, 1 ]
            },
            OrderOffset: { ID: '4b33cd18-61ef-4c17-b202-b471b9ed3f5c', Data: 0 },
            ParentReference: '8194fe1b-d719-45e7-95da-989f68f6b092',
            Children: [
              {
                ID: '23549e69-2f81-4320-81dd-52bf220233f9',
                Components: {
                  ID: '478bf93f-5c78-4b00-8d73-6dfb6a50428f',
                  Data: [
                    {
                      Type: 'FrooxEngine.UIX.RectTransform',
                      Data: {
                        ID: '9ce8ea6c-7c74-460a-b7d1-776a083046b0',
                        'persistent-ID': 'ed8342c3-4990-4124-aa83-211edf65d9ba',
                        UpdateOrder: {
                          ID: 'cf143110-655e-47fa-a31d-8b46518683c8',
                          Data: 0
                        },
                        Enabled: {
                          ID: 'b92da430-1172-456a-b2e3-03686b9cecbb',
                          Data: true
                        },
                        AnchorMin: {
                          ID: '368dde74-00d8-472f-9382-55ecad464cc8',
                          Data: [ 0, 0 ]
                        },
                        AnchorMax: {
                          ID: 'fdd4722c-b54c-4005-b732-5f28c6b38006',
                          Data: [ 1, 1 ]
                        },
                        OffsetMin: {
                          ID: '6684dd41-17ae-4f41-8b5c-1d54fb93e21b',
                          Data: [ 2, 2 ]
                        },
                        OffsetMax: {
                          ID: '1b3d7753-c192-4c52-b2de-602d3bc2e97d',
                          Data: [ -2, -2 ]
                        },
                        Pivot: {
                          ID: 'c831eb95-8591-4949-94f1-9565a088b610',
                          Data: [ 0.5, 0.5 ]
                        }
                      }
                    },
                    {
                      Type: 'FrooxEngine.UIX.Text',
                      Data: {
                        ID: '5a53e2a6-dadc-4936-b9be-67518f306b36',
                        'persistent-ID': 'ebe5a389-8741-4ab9-ad12-66bb093157db',
                        UpdateOrder: {
                          ID: 'e6f4f5e7-e83f-4f19-9738-e3a9b0bbf12a',
                          Data: 0
                        },
                        Enabled: {
                          ID: 'd492b2c3-fc6a-4599-b9fd-f9c4672152c8',
                          Data: true
                        },
                        Font: {
                          ID: '0ffe3e13-ec63-43ff-9530-282590d2dfd2',
                          Data: 'a8fb5357-10c7-47e3-84c8-0852f044b341'
                        },
                        Content: {
                          ID: '9c9ab817-c546-4cf5-aabf-a3cbaf418fa4',
                          Data: 'Public'
                        },
                        ParseRichText: {
                          ID: 'cbdbe132-2baf-4459-9567-518b0b2379d7',
                          Data: true
                        },
                        NullContent: {
                          ID: '5cbd46d4-d80a-454a-98b7-1ac21b4286bc',
                          Data: null
                        },
                        Size: {
                          ID: '2899ca02-29e5-42ec-8510-4dcc7951081f',
                          Data: 64
                        },
                        HorizontalAlign: {
                          ID: '78838ab8-b10a-47e3-b8ef-8880c2835b97',
                          Data: 'Center'
                        },
                        VerticalAlign: {
                          ID: '010e52b7-752e-4e01-937f-92bb9dbf2b47',
                          Data: 'Middle'
                        },
                        AlignmentMode: {
                          ID: '221e8c8e-5357-4bc8-9d11-7e294006ae43',
                          Data: 'Geometric'
                        },
                        Color: {
                          ID: 'a4b6e183-5327-46c6-aded-86388bb6934e',
                          Data: [ 0, 0, 0, 1 ]
                        },
                        Materials: {
                          ID: '8f8e8d07-4cf1-4f87-a041-1fcc622c73ad',
                          Data: [
                            {
                              ID: '59c4650b-05b1-4020-8744-41564df387ab',
                              Data: 'e9a6e99a-61bb-43f7-a083-aad8fec91b76'
                            }
                          ]
                        },
                        LineHeight: {
                          ID: '59b77fef-f791-42e2-9361-9365d699986c',
                          Data: 0.800000011920929
                        },
                        MaskPattern: {
                          ID: 'f7c74d9a-34a9-46a0-a98b-4bd6bd415116',
                          Data: null
                        },
                        HorizontalAutoSize: {
                          ID: '15153610-8ecc-4def-9b7f-8e628c30bb9f',
                          Data: true
                        },
                        VerticalAutoSize: {
                          ID: 'e43d6afe-9d25-420a-b17f-550eb3ed49c8',
                          Data: true
                        },
                        AutoSizeMin: {
                          ID: 'e5bd74d9-4eeb-4794-bf3d-48830426ec9d',
                          Data: 8
                        },
                        AutoSizeMax: {
                          ID: '103825e1-8d75-4f8f-8d6b-a845348dac5e',
                          Data: 40
                        },
                        CaretPosition: {
                          ID: 'c554a49f-34d4-462f-9ef7-f5449ea0335a',
                          Data: -1
                        },
                        SelectionStart: {
                          ID: '5fabb276-45c3-42bd-9cbf-88dfd22a3474',
                          Data: -1
                        },
                        CaretColor: {
                          ID: '02062746-f5e7-4c81-9395-c5247eb5aaaa',
                          Data: [ 0, 0, 0, 0 ]
                        },
                        SelectionColor: {
                          ID: 'f2a41903-9228-4b90-93b9-040e6fec1503',
                          Data: [ 0, 0, 0, 0 ]
                        },
                        InteractionTarget: {
                          ID: '1e4ad578-b243-4710-abd2-96f1bb9caea1',
                          Data: true
                        },
                        '_legacyFontMaterial-ID': '69a1a702-ab6b-478c-9888-61f324e3f013',
                        '_legacyAlign-ID': 'c6b240b9-5c0c-4a35-869e-64a08cf3fe73'
                      }
                    },
                    {
                      Type: 'FrooxEngine.ValueCopy`1[[System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089]]',
                      Data: {
                        ID: 'cfcefd27-8596-4ac0-8ab3-2e885ba2e9af',
                        'persistent-ID': '9e1203f5-a089-4f38-ac9e-1f180ad09916',
                        UpdateOrder: {
                          ID: '879d0ac7-8898-40be-8a1a-51d538b073c6',
                          Data: 0
                        },
                        Enabled: {
                          ID: '436fa448-5abc-464f-a56d-f5d7e2fce71c',
                          Data: true
                        },
                        Source: {
                          ID: 'b0895103-d897-4657-aa9c-4d0d4c4ba095',
                          Data: 'f4739efb-b003-4966-9259-7ce5256d9d4f'
                        },
                        Target: {
                          ID: '1f58de96-0f30-47d6-9951-02d6b12c1307',
                          Data: '9c9ab817-c546-4cf5-aabf-a3cbaf418fa4'
                        },
                        WriteBack: {
                          ID: '139f8848-96f6-4f14-8457-1d2dc9430915',
                          Data: false
                        }
                      }
                    }
                  ]
                },
                Name: {
                  ID: '92f0f4cc-1173-4542-acdb-c0f249582062',
                  Data: 'Text'
                },
                Tag: {
                  ID: 'ed4811ea-f441-43c0-bef1-fd5d98f78f59',
                  Data: null
                },
                Active: {
                  ID: 'c0ad65a8-9430-47d8-8f1f-f0809249ea87',
                  Data: true
                },
                'Persistent-ID': '34ad2868-ba2d-424a-b45c-ae7fe4ea24ee',
                Position: {
                  ID: '3cb75f05-a363-47f1-b9ec-019f9b8d7831',
                  Data: [ 0, 0, 0 ]
                },
                Rotation: {
                  ID: 'e7ab8095-7244-44b7-bd6b-7c835a24e5d6',
                  Data: [ 0, 0, 0, 1 ]
                },
                Scale: {
                  ID: '9dcd8318-e9ff-41f5-9669-1e0485b38eb0',
                  Data: [ 1, 1, 1 ]
                },
                OrderOffset: {
                  ID: '1101a3e2-7deb-4ce5-9870-17e767cbd19e',
                  Data: 0
                },
                ParentReference: '777ab23c-91d3-431b-9ba0-af44db733143',
                Children: []
              }
            ]
          }
        ]
      }
    ]
  },
  Assets: [
    {
      Type: 'FrooxEngine.UI_UnlitMaterial',
      Data: {
        ID: '6f7b46b8-0237-49f1-a372-1da86573e072',
        persistent: { ID: 'c4f12384-0ed8-41b6-92a0-ddb6267f7dfc', Data: true },
        UpdateOrder: { ID: 'e765ccba-56d9-493e-8d20-be408613d431', Data: 0 },
        Enabled: { ID: 'afdde4f3-1b77-4c37-b1f6-8d5374926cf8', Data: true },
        HighPriorityIntegration: { ID: '4c936979-bec8-499c-9e09-e464130866c5', Data: false },
        Rect: {
          ID: '727ff129-a678-499c-8471-e6fe20a7740b',
          Data: { X: 0, Y: 0, Width: 0, Height: 0 }
        },
        RectClip: { ID: '4f2c8b5c-6401-46e2-9eee-32e89c9e70c1', Data: false },
        ColorMask: { ID: '148dcabd-451d-42e6-b9f0-492e6c34ecb0', Data: 'RGBA' },
        StencilComparison: { ID: '13ee2245-548b-4e70-8e88-5c7e4b5fb30f', Data: 'Always' },
        StencilOperation: { ID: 'c9678b41-4438-4131-bed6-a27f5459f4bc', Data: 'Keep' },
        StencilID: { ID: '8774d9c2-b82e-41c8-adac-f7262bc5032c', Data: 0 },
        StencilWriteMask: { ID: '79fea8cd-fe09-4eba-936e-63ec13915920', Data: 255 },
        StencilReadMask: { ID: '70cb0058-f8fa-4e9b-b196-a0c85460993a', Data: 255 },
        RenderQueue: { ID: '3b506f30-ef15-45ba-9c23-5c09b44a3b13', Data: -1 },
        '_shader-ID': '834d3e7b-ec68-448d-963b-35ef245ffa1f',
        Texture: { ID: '32047cdc-3e09-4dc4-b6fc-0d281f4ad286', Data: null },
        TextureScale: { ID: 'c9aafc83-0bd2-4e0d-b7c3-d7639a747272', Data: [ 1, 1 ] },
        TextureOffset: { ID: '34dc8133-f2ae-435f-b24a-29aef884c669', Data: [ 0, 0 ] },
        Tint: {
          ID: '7edee294-86a6-41c2-b1b5-8c091a0eba86',
          Data: [ 1, 1, 1, 1 ]
        },
        Overlay: { ID: '8375fd48-14bd-4e3e-8d3b-a14e338f384a', Data: false },
        OverlayTint: {
          ID: '6a160631-de7f-4a57-bafb-ce34c980a8aa',
          Data: [ 1, 1, 1, 0.5 ]
        },
        AlphaCutoff: {
          ID: 'd0a1fdd3-14f3-43e1-9625-577fbafc6974',
          Data: 0.009999999776482582
        },
        AlphaClip: { ID: '6094d381-77b1-414e-8241-5b6fd2b0cc0f', Data: true },
        TextureMode: {
          ID: 'eaebb3c0-2b8a-4e49-b5ec-91ca687eb63c',
          Data: 'DirectColor'
        },
        MaskTexture: { ID: 'bd9fd84d-1f41-4a9e-b1e6-0100749a5b37', Data: null },
        MaskScale: { ID: 'e142116c-097b-4b31-a804-1316e2b20e17', Data: [ 1, 1 ] },
        MaskOffset: { ID: '5e49d64b-b4e6-4c48-a1af-d8ea62f84cef', Data: [ 0, 0 ] },
        MaskMode: {
          ID: '2f104113-fba8-432d-ab69-b5ff47e01c14',
          Data: 'MultiplyAlpha'
        },
        BlendMode: { ID: '58f8231e-33b4-4cbe-893d-feca5528fd53', Data: 'Alpha' },
        Sidedness: { ID: 'ed23fb41-8546-4723-9b90-20a33783faf5', Data: 'Double' },
        ZWrite: { ID: '0ebd4796-75e4-4e6c-b51f-3c9e58e99ea4', Data: 'On' },
        ZTest: {
          ID: '8ba3734a-668e-4908-aba7-908a0f56d330',
          Data: 'LessOrEqual'
        },
        OffsetFactor: { ID: '664963ab-adfd-4bc6-b86b-80225f0a2bfa', Data: 1 },
        OffsetUnits: { ID: '3884e601-7448-4b4f-a418-61bda92d0837', Data: 100 }
      }
    },
    {
      Type: 'FrooxEngine.FontChain',
      Data: {
        ID: 'a8fb5357-10c7-47e3-84c8-0852f044b341',
        persistent: { ID: '402d3500-3635-476c-bc1e-a64da3596878', Data: true },
        UpdateOrder: { ID: 'f10f3b1c-cac5-4d3e-8274-ed557de5dc2d', Data: 0 },
        Enabled: { ID: '7e926302-98e2-4c09-abf7-15bbb2cb87a0', Data: true },
        HighPriorityIntegration: { ID: 'ebd28dfd-a8c4-4807-8282-a088b160de3b', Data: false },
        MainFont: {
          ID: '73980772-5185-4e7b-b01c-111191ec69a2',
          Data: '9a85996c-bdad-4440-a34e-1b70605ef63e'
        },
        FallbackFonts: {
          ID: '5a8998ee-e699-4ab7-84e5-f285c029e649',
          Data: [
            {
              ID: '0f6ab877-d1fd-4e6c-b834-307fc320829b',
              Data: 'e8516db7-c1c6-45d8-ad62-432f6a283b20'
            },
            {
              ID: '6584c56a-8dc6-44c1-bb91-f1bbd4248fdc',
              Data: '9b2e6dfe-1b85-45c4-ac5f-a4d38ebfa54b'
            },
            {
              ID: 'f6b21c3f-9df1-45e2-8ce5-a21791123306',
              Data: '5d8b6d2c-9f83-4276-819f-ca723453368e'
            },
            {
              ID: '4b1ae8fc-1dee-4345-b189-b13ceddd2de2',
              Data: '68a18cc7-6ee8-4552-95b8-2a625b178b4c'
            }
          ]
        }
      }
    },
    {
      Type: 'FrooxEngine.StaticFont',
      Data: {
        ID: '9a85996c-bdad-4440-a34e-1b70605ef63e',
        persistent: { ID: '3bee2e48-dbe7-4dd3-9ac4-6e6397a46b72', Data: true },
        UpdateOrder: { ID: '5da26480-d965-452c-b941-0c40975687a9', Data: 0 },
        Enabled: { ID: '28f0c876-d7ec-4d7d-9696-062e940a28dc', Data: true },
        URL: {
          ID: '583102c5-b9af-42f0-8c4f-6c18661efe02',
          Data: '@neosdb:///c801b8d2522fb554678f17f4597158b1af3f9be3abd6ce35d5a3112a81e2bf39'
        },
        Padding: { ID: 'fa10168b-946d-4f24-a3d1-206ff05e3b71', Data: 1 },
        PixelRange: { ID: '46c7017f-2f4f-4225-beeb-862fe8831b33', Data: 4 },
        GlyphEmSize: { ID: '2f48bf1e-0783-487c-9a90-ef8ef1aa5940', Data: 32 }
      }
    },
    {
      Type: 'FrooxEngine.StaticFont',
      Data: {
        ID: 'e8516db7-c1c6-45d8-ad62-432f6a283b20',
        persistent: { ID: 'a3e2a93d-b4dd-477f-ab2c-615566e20f41', Data: true },
        UpdateOrder: { ID: 'f6206aa7-9182-4472-9f94-752e588412b6', Data: 0 },
        Enabled: { ID: 'be73e27a-eb44-424d-a6af-d3c43d68a306', Data: true },
        URL: {
          ID: '1fb2b1c7-14ca-45be-bf5a-e3ad3466816a',
          Data: '@neosdb:///4cac521169034ddd416c6deffe2eb16234863761837df677a910697ec5babd25'
        },
        Padding: { ID: 'a1fcb658-b2ae-4b9e-b656-c0c01ab109f7', Data: 1 },
        PixelRange: { ID: 'e82b2e23-a246-44b0-9578-b4befd2e106b', Data: 4 },
        GlyphEmSize: { ID: '9742d55e-50ce-4669-abea-a7f75ce4557d', Data: 32 }
      }
    },
    {
      Type: 'FrooxEngine.StaticFont',
      Data: {
        ID: '9b2e6dfe-1b85-45c4-ac5f-a4d38ebfa54b',
        persistent: { ID: 'fb60aae6-c9eb-4892-afe1-b0b74b9049ec', Data: true },
        UpdateOrder: { ID: '26626b3b-d195-4c67-a902-774950ec54bb', Data: 0 },
        Enabled: { ID: '9a2dab94-51ec-42a1-b978-65315db1d138', Data: true },
        URL: {
          ID: 'ae8d6ad2-72c5-4ee2-b89e-72b749f556a0',
          Data: '@neosdb:///23e7ad7cb0a5a4cf75e07c9e0848b1eb06bba15e8fa9b8cb0579fc823c532927'
        },
        Padding: { ID: 'efd81825-b411-405b-bc57-0b9d811b9d11', Data: 1 },
        PixelRange: { ID: '4a283e2f-d826-445a-a3f6-ccc246ddd471', Data: 4 },
        GlyphEmSize: { ID: '5c6f6cc3-e63f-4433-b524-cf56fcb662f5', Data: 32 }
      }
    },
    {
      Type: 'FrooxEngine.StaticFont',
      Data: {
        ID: '5d8b6d2c-9f83-4276-819f-ca723453368e',
        persistent: { ID: '04193feb-39e4-46f7-a2d8-d7bfe2df798c', Data: true },
        UpdateOrder: { ID: 'c1d7beed-d156-4ee8-9951-63b678f023d5', Data: 0 },
        Enabled: { ID: 'c614aeb4-cb28-465c-8382-f6848d33b000', Data: true },
        URL: {
          ID: '45a5783e-f7f9-425d-bcc8-68db751a871c',
          Data: '@neosdb:///415dc6290378574135b64c808dc640c1df7531973290c4970c51fdeb849cb0c5'
        },
        Padding: { ID: '042fc9e7-cb7a-4c90-b8e5-b97d3a65bea0', Data: 1 },
        PixelRange: { ID: '0593e654-ed72-44d8-a0c2-8c650ca0f68f', Data: 4 },
        GlyphEmSize: { ID: 'f098818c-d633-492a-ac02-34aeedc02651', Data: 32 }
      }
    },
    {
      Type: 'FrooxEngine.StaticFont',
      Data: {
        ID: '68a18cc7-6ee8-4552-95b8-2a625b178b4c',
        persistent: { ID: 'a9d63360-3454-4c1c-893f-c2bfb5edb6cb', Data: true },
        UpdateOrder: { ID: 'f3d04cd2-9b22-4b5f-ad61-fe6177835e15', Data: 0 },
        Enabled: { ID: '9fec6e51-77ae-4bff-b586-933c6a66ca0b', Data: true },
        URL: {
          ID: '15e3e917-7099-4ac6-8369-8873225c7c85',
          Data: '@neosdb:///bcda0bcc22bab28ea4fedae800bfbf9ec76d71cc3b9f851779a35b7e438a839d'
        },
        Padding: { ID: 'e40d950b-fa98-49ff-bd69-a2db49a70f59', Data: 1 },
        PixelRange: { ID: '80b60b6d-c3d3-44a7-9956-9a26067b2fe1', Data: 4 },
        GlyphEmSize: { ID: '2d775ac4-ad2a-4d7f-8d45-490328fccbff', Data: 32 }
      }
    },
    {
      Type: 'FrooxEngine.UI_TextUnlitMaterial',
      Data: {
        ID: 'e9a6e99a-61bb-43f7-a083-aad8fec91b76',
        persistent: { ID: '22c0d9e0-6f97-4e22-82cb-80d076df9129', Data: true },
        UpdateOrder: { ID: 'c7c2fc96-f344-48fd-b677-c1f2cb675172', Data: 0 },
        Enabled: { ID: 'df439e0a-3ed3-4e3f-bbee-01bf4cbfbc3f', Data: true },
        HighPriorityIntegration: { ID: 'f35001e7-2c3c-4e21-9e20-1465abc60d9f', Data: false },
        '_shader-ID': 'ba4d98e4-5e47-4de0-b648-d6e851373844',
        FontAtlas: { ID: 'fa35e648-7bca-4960-b46b-3bfbf43fac0c', Data: null },
        TintColor: {
          ID: 'b4571d0f-8d0b-4605-a1b2-12c4e8d082f2',
          Data: [ 1, 1, 1, 1 ]
        },
        OutlineColor: {
          ID: '934d396f-550d-47de-9934-8f01512041f0',
          Data: [ 0, 0, 0, 1 ]
        },
        BackgroundColor: {
          ID: '82647926-6ce3-477f-964a-19501a11fe7a',
          Data: [ 0, 0, 0, 1 ]
        },
        AutoBackgroundColor: { ID: '21a04a58-968c-4c57-ac2f-cf27659fb9bf', Data: true },
        GlyphRenderMethod: { ID: 'd2fa7d09-6f04-4b83-b7cb-0937889d8bbb', Data: 'MSDF' },
        PixelRange: { ID: 'e6e967ec-aaae-492d-8476-8513e6b0cd2d', Data: 4 },
        FaceDilate: { ID: '902b39d0-6e0b-4397-af60-1e15d03c1733', Data: 0 },
        OutlineThickness: { ID: '3a07eacc-89b5-46c9-a45c-e14c6b1e47e4', Data: 0 },
        FaceSoftness: { ID: 'c07d5d75-20ce-4049-950a-61440086b620', Data: 0 },
        BlendMode: { ID: 'eb8b3485-df3d-4cc2-adcb-e6b6774a2c1f', Data: 'Alpha' },
        Sidedness: { ID: '6a276824-362e-40f3-8daf-6897ce71d46d', Data: 'Double' },
        ZWrite: { ID: '54155ee4-6afa-476f-98ce-e96583f6a7dc', Data: 'Auto' },
        ZTest: {
          ID: '3840f327-c634-48fc-8366-35594b252232',
          Data: 'LessOrEqual'
        },
        OffsetFactor: { ID: 'b24374ce-2423-4068-a3e4-d040f1fe55f2', Data: 0 },
        OffsetUnits: { ID: '256788c7-9be4-4f36-af7a-c8459042fb85', Data: 0 },
        RenderQueue: { ID: 'f17eae9b-6c24-4e39-b48e-3cac0d2332b2', Data: -1 },
        Overlay: { ID: '117f88a7-b02d-4283-9dbe-a5c466fbaefb', Data: false },
        OverlayTint: {
          ID: 'cb1cb40f-4692-47c8-bed3-52044f04bd4d',
          Data: [ 1, 1, 1, 0.5 ]
        },
        Rect: {
          ID: 'f4911a89-51af-4a05-9ebc-94d5fe5e4424',
          Data: { X: 0, Y: 0, Width: 0, Height: 0 }
        },
        RectClip: { ID: 'cc36f350-d896-4d5e-9752-21789c39f8ac', Data: false },
        ColorMask: { ID: '6b584029-7294-492a-9f9a-ef8d178f2aca', Data: 'RGBA' },
        StencilComparison: { ID: 'cfbee9a5-95f2-4f39-8f05-37f666f25a94', Data: 'Always' },
        StencilOperation: { ID: 'e3c4a450-59aa-4790-823b-195900a531e6', Data: 'Keep' },
        StencilID: { ID: '2f057dfd-251b-4fcc-bd4b-32e60690a83d', Data: 0 },
        StencilWriteMask: { ID: '030ad5a4-ab1d-4faf-b946-4144393a7516', Data: 255 },
        StencilReadMask: { ID: 'a3e65033-24e9-43a7-9a85-32c6a3fc371c', Data: 255 }
      }
    }
  ],
  TypeVersions: {
    'FrooxEngine.InventoryItem': 1,
    'FrooxEngine.Grabbable': 2,
    'FrooxEngine.UIX.Canvas': 1,
    'FrooxEngine.UIX.RectTransform': 1,
    'FrooxEngine.BoxCollider': 1,
    'FrooxEngine.UIX.Image': 1,
    'FrooxEngine.UIX.Text': 1,
    'FrooxEngine.UI_UnlitMaterial': 2
  }
});
