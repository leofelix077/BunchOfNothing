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

    const GOOGLE_SERVICE_ACCOUNT = ssm.StringParameter.valueForSecureStringParameter(
      this,
      "google-service-account",
      1
    );

    console.log(GOOGLE_SERVICE_ACCOUNT);

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
            GOOGLE_SERVICE_ACCOUNT: `{"type":"service_account","project_id":"bunch-of-nothing","private_key_id":"ef430b25750a563bd746ff42ab689747c4c8932b","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDGaQSGBvKsU404\nspDcwDeWmgNUsF3VfAFHWfN4AKPQ0QgNk4+fUqbEcfEsAMaCJwERNh32gbtyxDYl\nm25oK7cDSQmlUu86ELksssofdrLoyDuRRvXhqGQzDz5rnPZHrtqEdz0ibb6AgOwh\nSTJp3kYJNJc0/3mQnjn3WhnjoK7OI3I0u6Dv7cq0oobLk3EoOPIp71d0VsR5zfbc\n0oS7HmWZIQZugcT6k+HrqR/LpFqKU3zW3CusKPimdUNtJpk3C7pzf9r/p08AgNq/\niphzrMmytvVtwN5O0G1akUNf/1JXRq2hK2RwS18gRgXeR+7vQP/6LnxdhInaVe6m\n54fM6mAZAgMBAAECggEACGjzWtXL9UqVve7+HYh9crVBg3zCsj9cDVDk27o1nchj\nQOWqnOeG3EtmHEx5UMZj3bDMPiKLaWOjiR5Yl8xhwmv9bC2i26e4Az4eCI2VkZdj\n98lcHiRvAHKndy4QJF0aTXe00CytrZdWKvNsa+wsTmYu+JcEz82QVtZrXYIpY3rH\n14DczwBKSlDD/nxQ89fKaRgBxXmjj0l6BuH7HfUx+u/aYfViP/8bMK/qmEOXdEaF\nyOu6fSF8yAsFx5Q5NP4mWdINEgdVaNV7JmApHLwFMPug9O9bvs5JIXfQCL5GIrJy\nagycj1rZhLp32TQWs6/xfdkMaIjGugCTrk1H0gfNuQKBgQDmVm6xx33SeEqAF+jL\nkYjMJLp+7DQYchsYcxoZeRoNFKGCVm7ct/Aw2q952L90+e/m1V15oV9A8LtqmV7e\nYsZztNiNSgQ6thB8MZcSCi2+6J1buXSQVdePdDTRelVuAYASG5w1ebXq+1w1isSC\nfVEeBmcK09MSg8/ed/ChsPsnVQKBgQDcg/gHo08bjv5NYXZoybOeLLimhTjsqBoc\nHXhHSS0mH60rEgD9yi1dWjq2RXxMTXCaHweXnZXZ40AphNR1NDDEgz/nyXM/LuKb\ne5fEOLcSEclIaFw0Cwze2BdkazTBJLRSnhRiglZgGjAHjtJPAOKa2tHOTbqQyMKH\nPd6feHdNtQKBgQDhKDY2pFpTJfE1e6m9bHr7ix+euEhIaSohYUpvAhk8FiG25cSj\nD07EgtCrW/vzXepri8A/CEazlV6u2lOJMabqLirNGkA+IADHVjZllPuYtYw0wHm4\nKaF4glCrQFlIGkFV8hVllJ8Gn0VItWhYYiWsIvgQ9nVKkPzebAIWHIm1rQKBgHz4\nWVdSyOFQX3RRGL74GFA6/gZ5F7Ke7fUjCmgz419oskXndSJfMuhl20IzDOddN8RQ\nc4gMKcGK1XDyM0mc40prK4tbknGrS4dcOr1cevvFkrHzWtWvsYKVKmShkQsolvz/\nU4QkY3khPjj6Stu1H7cs7ZwiVun4rK3idUkhB1PFAoGBAKihHe0VMLiZjZmMXtz0\nNqxOT3j/ubkP245K91a3PW14Nlx2jXFe/Ii+Rn1QyUDcRiQY0g02FURzGea4pU9/\nSNkMqQq3+frLTrXUvesCPlwHfrFTAle7yEvAcG59AlIynzI+hpInzvMiG3I7UqaB\n7M0AGCVAzRAAvtxR1Y//vo+m\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-wm9wq@bunch-of-nothing.iam.gserviceaccount.com","client_id":"106935929730276423693","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-wm9wq%40bunch-of-nothing.iam.gserviceaccount.com"}`,
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
