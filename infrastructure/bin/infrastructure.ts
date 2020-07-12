import cdk = require("@aws-cdk/core");
import ecr = require("@aws-cdk/aws-ecr");
import ecs = require("@aws-cdk/aws-ecs");
import ec2 = require("@aws-cdk/aws-ec2");
import ssm = require("@aws-cdk/aws-ssm");
import ecsPatterns = require("@aws-cdk/aws-ecs-patterns");

const AWS_ACCOUNT = process.env.AWS_ACCOUNT;
const AWS_REGION = process.env.AWS_REGION;
export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repo = ecr.Repository.fromRepositoryArn(
      this,
      "nothing-api",
      "arn:aws:ecr:eu-central-1:502612239066:repository/bunch-of-nothing/nothing-api"
    );

    const vpc = new ec2.Vpc(this, "NothingVPC", { maxAzs: 2 });
    // ECS cluster/resources
    const cluster = new ecs.Cluster(this, "nothing-cluster", {
      clusterName: "nothing-cluster2",
      vpc,
    });

    cluster.addCapacity("app-scaling-group2", {
      instanceType: new ec2.InstanceType("t2.micro"),
      minCapacity: 1,
      maxCapacity: 8,
      machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
    });

    const image = ecs.ContainerImage.fromEcrRepository(repo, "latest");

    const GOOGLE_SERVICE_ACCOUNT = ssm.StringParameter.valueForStringParameter(
      this,
      "google-service-account-a",
      1
    );

    const loadBalancer = new ecsPatterns.ApplicationLoadBalancedEc2Service(
      this,
      "app-service2",
      {
        cluster,
        memoryLimitMiB: 512,
        cpu: 2,
        desiredCount: 1,
        serviceName: "nothing-api",
        taskImageOptions: {
          image,
          containerPort: 8080,
          environment: {
            GOOGLE_SERVICE_ACCOUNT,
          },
        },
        publicLoadBalancer: true,
      }
    );
    repo.grant(loadBalancer.taskDefinition.executionRole as any, "ecr:*");
    repo.grant(loadBalancer.taskDefinition.taskRole as any, "ecr:*");
  }
}

const app = new cdk.App();

new InfrastructureStack(app, "NothingStack2", {
  env: { account: AWS_ACCOUNT, region: AWS_REGION },
});

app.synth();
