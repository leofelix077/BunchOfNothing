import cdk = require("@aws-cdk/core");
import ecr = require("@aws-cdk/aws-ecr");
import ecs = require("@aws-cdk/aws-ecs");
import ec2 = require("@aws-cdk/aws-ec2");
import ssm = require("@aws-cdk/aws-ssm");
import elbv2 = require("@aws-cdk/aws-elasticloadbalancingv2");

const AWS_ACCOUNT = process.env.AWS_ACCOUNT;
const AWS_REGION = process.env.AWS_REGION;
export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repo = ecr.Repository.fromRepositoryArn(
      this,
      "nothing-api-repo",
      "arn:aws:ecr:eu-central-1:502612239066:repository/bunch-of-nothing/nothing-api"
    );

    const vpc = new ec2.Vpc(this, "NothingVPC", { maxAzs: 2 });
    // ECS cluster/resources
    const cluster = new ecs.Cluster(this, "nothing-cluster", {
      clusterName: "nothing-cluster2",
      vpc,
    });

    const asg = cluster.addCapacity("app-scaling-group2", {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
      minCapacity: 1,
      maxCapacity: 4,
    });

    const image = ecs.ContainerImage.fromEcrRepository(repo, "latest");

    const taskDefinition = new ecs.Ec2TaskDefinition(this, "nothing-api");

    const logDriver = new ecs.AwsLogDriver({
      streamPrefix: "ecs",
    });

    const FIREBASE_PRIVATE_KEY = ssm.StringParameter.valueForStringParameter(
      this,
      "firebase-private-key",
      2
    );

    const FIREBASE_PRIVATE_KEY_ID = ssm.StringParameter.valueForStringParameter(
      this,
      "firebase-private-key-id",
      1
    );

    const container = taskDefinition.addContainer("web", {
      image,
      memoryLimitMiB: 256,
      logging: logDriver,
      environment: {
        FIREBASE_PRIVATE_KEY,
        NODE_PORT: "8080",
        FIREBASE_PRIVATE_KEY_ID,
      },
    });

    container.addPortMappings({
      containerPort: 8080,
      hostPort: 8080,
      protocol: ecs.Protocol.TCP,
    });

    const service = new ecs.Ec2Service(this, "app-service2", {
      cluster,
      taskDefinition,
    });

    const lb = new elbv2.ApplicationLoadBalancer(this, "LB", {
      vpc,
      internetFacing: true,
    });

    const listener = lb.addListener("Listener", {
      port: 80,
      open: true,
    });

    listener.addTargets("Target", {
      port: 80,
      targets: [
        asg,
        service.loadBalancerTarget({
          containerName: "web",
          containerPort: 8080,
        }),
      ],
    });

    listener.connections.allowDefaultPortFromAnyIpv4("Public API");

    repo.grant(taskDefinition.executionRole as any, "ecr:*");
    repo.grant(taskDefinition.taskRole as any, "ecr:*");
    repo.grant(service.taskDefinition.taskRole, "ecr:*");

    asg.scaleOnRequestCount("LoadRequest", {
      targetRequestsPerSecond: 1,
    });

    new cdk.CfnOutput(this, "LoadBalancerDNS", {
      value: lb.loadBalancerDnsName,
    });
  }
}

const app = new cdk.App();

new InfrastructureStack(app, "NothingStack2", {
  env: { account: AWS_ACCOUNT, region: AWS_REGION },
});

app.synth();
