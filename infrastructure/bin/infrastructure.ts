import cdk = require("@aws-cdk/core");
import ecr = require("@aws-cdk/aws-ecr");
import ecs = require("@aws-cdk/aws-ecs");
import ec2 = require("@aws-cdk/aws-ec2");
import ecsPatterns = require("@aws-cdk/aws-ecs-patterns");

const AWS_ACCOUNT = process.env.AWS_ACCOUNT;
const AWS_REGION = process.env.AWS_REGION;
export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "NothingVPC", { maxAzs: 2 });
    // ECS cluster/resources
    const cluster = new ecs.Cluster(this, "nothing-cluster", {
      clusterName: "nothing-cluster",
      vpc,
    });

    cluster.addCapacity("app-scaling-group", {
      instanceType: new ec2.InstanceType("t2.micro"),
      minCapacity: 1,
      maxCapacity: 8,
      machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
    });

    const loadBalancer = new ecsPatterns.ApplicationLoadBalancedEc2Service(
      this,
      "app-service",
      {
        cluster,
        memoryLimitMiB: 512,
        cpu: 2,
        desiredCount: 1,
        serviceName: "nothing-api",

        taskImageOptions: {
          image: ecs.ContainerImage.fromRegistry(
            "502612239066.dkr.ecr.eu-central-1.amazonaws.com/bunch-of-nothing/nothing-api:latest"
          ),
          containerPort: 8080,
        },
        publicLoadBalancer: true,
      }
    );
  }
}

const app = new cdk.App();

new InfrastructureStack(app, "NothingStack", {
  env: { account: AWS_ACCOUNT, region: AWS_REGION },
});

app.synth();
