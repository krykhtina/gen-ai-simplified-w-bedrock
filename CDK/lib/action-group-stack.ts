import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CfnAgent } from "aws-cdk-lib/aws-bedrock";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";

export class ActionGroupStack extends Stack {
    readonly actionGroupProperties: CfnAgent.AgentActionGroupProperty;
    readonly actionGroupSchemaArn: string;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props)
    
    const bucket = new Bucket(this, "AgentBucket");

    // Upload schema to S3
    new BucketDeployment(this, "Deployment", {
      sources: [Source.asset("../BookingAPI/schema")],
      destinationBucket: bucket,
    });

    const s3BucketName = bucket.bucketName;
    const s3ObjectKey = "api.yaml";
    this.actionGroupSchemaArn = `arn:aws:s3:::${s3BucketName}/${s3ObjectKey}`

    const actionGroupLambda = new NodejsFunction(
        this,
        "actionGroupLambda",
        {
          entry: "./lib/bookingApi/index.ts",
          handler: "handler",
          runtime: Runtime.NODEJS_18_X,
          timeout: Duration.minutes(15),
        }
      );

      actionGroupLambda.addPermission('BedrockPermission', {
        principal: new ServicePrincipal('bedrock.amazonaws.com'),
        action: 'lambda:InvokeFunction'
        });


      this.actionGroupProperties = {
        actionGroupName: 'Booking',
        actionGroupExecutor: {
          lambda: actionGroupLambda.functionArn
        },
        apiSchema: {
          s3: {
            s3BucketName: s3BucketName,
            s3ObjectKey: s3ObjectKey,
          }
        },
        description: 'This is an API that allows to book properties available on OMG Booking webside.',
      };
    }
}